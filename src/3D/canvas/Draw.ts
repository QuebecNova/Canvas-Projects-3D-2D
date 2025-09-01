import { getCanvas } from '@/common/getCanvas'
import { Matrix } from '@/common/Matrix'
import { Singleton } from '@/common/Singleton'
import { cos, pi, round, sin } from 'mathjs'
import { Frustum } from '../math/Frustum'
import { Mat4 } from '../math/Mat4'
import { Buffers } from './buffers'
import { Chunks } from './chunks'
import { Shaders } from './shaders'

type InitialArguments = {
    canvas: HTMLCanvasElement
    gl: WebGL2RenderingContext
    startDate?: Date
}

export class Draw3D implements Singleton {
    private static instances: Draw3D[] = []
    private canvas: HTMLCanvasElement
    private gl: WebGL2RenderingContext
    private statsElement: HTMLDivElement
    static renderDistance: number = 10
    static scale = 1
    static frustum?: Frustum
    deltaTime: number = 0
    id: string
    elapsedTime: number = 0
    aspectRatio: number
    fov: number = pi / 2
    zNear: number = 1
    zFar: number = 2000
    static camera = {
        x: Chunks.width / 2,
        y: Chunks.height + 2,
        z: Chunks.width / 2,
        α: 0,
        β: 0,
        speed: 7,
        sensitivity: 0.02,
    }
    keyPressed = {
        KeyW: false,
        KeyA: false,
        KeyS: false,
        KeyD: false,
        ShiftLeft: false,
        Space: false,
    }
    shaders: Shaders
    buffers: Buffers
    chunks: Chunks
    then = 0

    constructor({ canvas, gl }: InitialArguments) {
        this.canvas = canvas
        this.canvas.hidden = false
        this.gl = gl
        this.id = canvas.id
        const statsElement = this.setupCanvas()
        this.statsElement = statsElement
        this.aspectRatio = this.gl.canvas.height / this.gl.canvas.width
        this.addEventListeners()
        this.buffers = new Buffers({ gl: this.gl })
        this.shaders = new Shaders({ gl: this.gl })
        this.chunks = new Chunks({
            shaders: this.shaders,
            gl: this.gl,
        })
        this.stats()

        const instance = this.findOne(this.id)
        if (instance) {
            return instance
        } else {
            Draw3D.instances.push(this)
        }
    }

    main(startDate: Date, now: number) {
        now *= 0.001
        const deltaTime = now - this.then
        this.deltaTime = deltaTime
        this.then = now
        const newDate = new Date()
        this.elapsedTime = (newDate.getTime() - (startDate || newDate).getTime()) / 1000
        this.move(deltaTime)
        this.clearCanvas()

        this.enableAttribs()
        this.setMatrices()

        this.chunks.draw()

        window.requestAnimationFrame((now) => this.main(startDate, now))
    }

    private stats() {
        setInterval(() => {
            const fps = round(1 / (this.deltaTime === 0 ? 1 / 60 : this.deltaTime))
            for (const child of this.statsElement.children) {
                if (child.id === 'fps') {
                    child.textContent = `${fps}`
                }
                if (child.id === 'position') {
                    child.innerHTML = `x:${Draw3D.camera.x.toFixed(2)} y:${Draw3D.camera.y.toFixed(2)} z:${Draw3D.camera.z.toFixed(2)}`
                }
            }
        }, 100)
    }

    private setMatrices() {
        // const r = this.elapsedTime * (pi / 16)
        // Compute a matrix for the camera
        const cameraTranslationMatrix = Mat4.Translation.xyz(Draw3D.camera.x, Draw3D.camera.y, Draw3D.camera.z)
        const cameraRotationMatrix = Mat4.Rotation.xyz(Draw3D.camera.α, Draw3D.camera.β, 0)
        const cameraMatrix = cameraTranslationMatrix.multiply(cameraRotationMatrix)

        const viewMatrix = cameraMatrix.invert() || Matrix.getIdentityMatrix(4)

        const projectionMatrix = Mat4.Projection(this.aspectRatio, this.fov, this.zFar, this.zNear)
        const scaleMatrix = Mat4.Scaling.xyz(Draw3D.scale, Draw3D.scale, Draw3D.scale)
        const projectionViewMatrix =
            Draw3D.scale !== 1
                ? projectionMatrix.multiply(viewMatrix).multiply(scaleMatrix)
                : projectionMatrix.multiply(viewMatrix)
        this.gl.uniformMatrix4fv(
            this.shaders.uniformLocations.projectionViewMatrix,
            false,
            projectionViewMatrix.toArray()
        )
        Draw3D.frustum = new Frustum(projectionViewMatrix)
    }

    private enableAttribs() {
        this.buffers.normals.forEach((normal, face) => {
            this.gl.uniform3fv(this.shaders.uniformLocations.normal(face), normal)
        })
    }

    enableAttrib(size: number, buffer: WebGLBuffer, loc: number) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
        const type = this.gl.FLOAT // the data is 32bit floats
        const normalize = false // don't normalize the data
        const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0 // start at the beginning of the buffer
        this.gl.vertexAttribPointer(loc, size, type, normalize, stride, offset)
        this.gl.enableVertexAttribArray(loc)
    }

    private setupCanvas() {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
        this.gl.enable(this.gl.CULL_FACE)
        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.depthFunc(this.gl.LEQUAL)
        this.clearCanvas()
        const container = document.body.querySelector('.canvas-contanier')
        const stats = document.createElement('div')
        const div1 = document.createElement('div')
        const div2 = document.createElement('div')
        stats.id = 'stats'
        div2.id = 'fps'
        div1.id = 'position'
        stats.appendChild(div1)
        stats.appendChild(div2)
        if (!container) return stats
        container.appendChild(stats)
        return stats
    }

    private addEventListeners() {
        let pointerLockActivatedAt: number | null = null
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement !== this.canvas) {
                document.onmousemove = null
                document.onkeydown = null
                document.onkeyup = null
                return
            }
            document.onmousemove = (e) => {
                Draw3D.camera.α += (e.movementY / pi) * Draw3D.camera.sensitivity
                Draw3D.camera.β += (e.movementX / pi) * Draw3D.camera.sensitivity
            }
            document.onkeydown = (e) => {
                e.preventDefault()
                const key = e.code
                if (document.pointerLockElement === this.canvas && key && Object.hasOwn(this.keyPressed, key)) {
                    this.keyPressed[key as keyof typeof this.keyPressed] = true
                }
                return false
            }
            document.onkeyup = (e) => {
                e.preventDefault()
                const key = e.code
                if (key && Object.hasOwn(this.keyPressed, key)) {
                    this.keyPressed[key as keyof typeof this.keyPressed] = false
                }
                return false
            }
        })
        this.canvas.addEventListener('click', async () => {
            const now = performance.now()
            const minDelay = 2000
            if (pointerLockActivatedAt !== null && now - pointerLockActivatedAt < minDelay) {
                return
            }
            pointerLockActivatedAt = now
            await this.canvas.requestPointerLock()
        })
        // window.addEventListener('beforeunload', (e) => {
        //     e.preventDefault()
        // })
    }

    private move(deltaTime: number) {
        if (this.keyPressed.KeyW) this.actions.forward(deltaTime)
        if (this.keyPressed.KeyS) this.actions.backward(deltaTime)
        if (this.keyPressed.KeyD) this.actions.right(deltaTime)
        if (this.keyPressed.KeyA) this.actions.left(deltaTime)
        if (this.keyPressed.Space) this.actions.up(deltaTime)
        if (this.keyPressed.ShiftLeft) this.actions.down(deltaTime)
    }
    private actions = {
        forward: (deltaTime: number) => {
            Draw3D.camera.x += sin(Draw3D.camera.β) * Draw3D.camera.speed * deltaTime * Draw3D.scale
            Draw3D.camera.y -= sin(Draw3D.camera.α) * Draw3D.camera.speed * deltaTime * Draw3D.scale
            Draw3D.camera.z += cos(Draw3D.camera.β) * Draw3D.camera.speed * deltaTime * Draw3D.scale
        },
        backward: (deltaTime: number) => {
            Draw3D.camera.x -= sin(Draw3D.camera.β) * Draw3D.camera.speed * deltaTime * Draw3D.scale
            Draw3D.camera.y += sin(Draw3D.camera.α) * Draw3D.camera.speed * deltaTime * Draw3D.scale
            Draw3D.camera.z -= cos(Draw3D.camera.β) * Draw3D.camera.speed * deltaTime * Draw3D.scale
        },
        right: (deltaTime: number) => {
            Draw3D.camera.x += sin(Draw3D.camera.β + pi / 2) * Draw3D.camera.speed * deltaTime * Draw3D.scale
            Draw3D.camera.z += cos(Draw3D.camera.β + pi / 2) * Draw3D.camera.speed * deltaTime * Draw3D.scale
        },
        left: (deltaTime: number) => {
            Draw3D.camera.x += sin(Draw3D.camera.β - pi / 2) * Draw3D.camera.speed * deltaTime * Draw3D.scale
            Draw3D.camera.z += cos(Draw3D.camera.β - pi / 2) * Draw3D.camera.speed * deltaTime * Draw3D.scale
        },
        up: (deltaTime: number) => {
            Draw3D.camera.y += Draw3D.camera.speed * deltaTime * Draw3D.scale
        },
        down: (deltaTime: number) => {
            Draw3D.camera.y -= Draw3D.camera.speed * deltaTime * Draw3D.scale
        },
    }

    private clearCanvas() {
        this.canvas.height = window.innerHeight - 100
        this.canvas.width = window.innerWidth - 20
        this.aspectRatio = this.gl.canvas.height / this.gl.canvas.width
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
        this.gl.clearColor(130 / 255, 183 / 255, 254 / 255, 1.0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
        this.gl.clearDepth(this.gl.DEPTH_BUFFER_BIT)
    }

    clear() {
        const { canvas } = getCanvas('canvas_3D_main', 'webgl')
        if (canvas) {
            canvas.width = 0
            canvas.height = 0
            canvas.hidden = true
        }
    }

    findOne(id: string) {
        return Draw3D.instances.find((inctance) => inctance.id === id)
    }
}
