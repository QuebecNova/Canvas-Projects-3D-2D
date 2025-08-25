import { getCanvas } from '@/lib/common/getCanvas'
import { Singleton } from '@/lib/common/Singleton'
import { pi } from 'mathjs'
import { Mat4 } from '../math/Mat4'
import { Buffers } from './buffers'
import { Shaders } from './shaders'

type InitialArguments = {
    canvas: HTMLCanvasElement
    gl: WebGLRenderingContext
    startDate?: Date
}

export class Draw3D implements Singleton {
    private static instances: Draw3D[] = []
    private canvas: HTMLCanvasElement
    private gl: WebGLRenderingContext
    id: string
    elapsedTime: number
    aspectRatio: number
    fov: number
    zNear: number = 1.0
    zFar: number = 2000.0

    constructor({ canvas, gl, startDate }: InitialArguments) {
        const newDate = new Date()
        this.elapsedTime =
            (newDate.getTime() - (startDate || newDate).getTime()) / 1000
        this.canvas = canvas
        this.canvas.hidden = false
        this.canvas.height = window.innerHeight - 100
        this.canvas.width = window.innerWidth - 20
        this.gl = gl
        this.id = canvas.id
        this.setupCanvas()
        this.aspectRatio = this.gl.canvas.height / this.gl.canvas.width
        this.fov = pi / 2

        const instance = this.findOne(this.id)
        if (instance) {
            return instance
        } else {
            Draw3D.instances.push(this)
        }
    }

    main(startDate: Date) {
        const newDate = new Date()
        const elapsedTime =
            (newDate.getTime() - (startDate || newDate).getTime()) / 1000
        const shaders = new Shaders({ gl: this.gl })
        if (!shaders.program) return
        const buffers = new Buffers({ gl: this.gl })

        this.clearCanvas()

        this.gl.useProgram(shaders.program)

        var size = 3 // 3 components per iteration
        var type = this.gl.FLOAT // the data is 32bit floats
        var normalize = false // don't normalize the data
        var stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0 // start at the beginning of the buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position)
        this.gl.vertexAttribPointer(
            shaders.attribLocations.vertexPosition,
            size,
            type,
            normalize,
            stride,
            offset
        )
        this.gl.enableVertexAttribArray(shaders.attribLocations.vertexPosition)

        var size = 4 // 4 components per iteration
        var type = this.gl.FLOAT // the data is 32bit floats
        var normalize = false // don't normalize the data
        var stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0 // start at the beginning of the buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.color)
        this.gl.vertexAttribPointer(
            shaders.attribLocations.vertexColor,
            size,
            type,
            normalize,
            stride,
            offset
        )
        this.gl.enableVertexAttribArray(shaders.attribLocations.vertexColor)

        const translationMatrix = Mat4.Translation.xyz(0, 0, -1.5)
        const projectionMatrix = Mat4.Projection(
            this.aspectRatio,
            this.fov,
            this.zFar,
            this.zNear
        )
        const scale = 1 / 2
        const scalingMatrix = Mat4.Scaling.xyz(scale, scale, scale)
        const r = elapsedTime * (pi / 4)
        const rotationMatrix = Mat4.Rotation.xyz(r / 2, r * 2, r)
        this.gl.uniformMatrix4fv(
            shaders.uniformLocations.matrix,
            false,
            projectionMatrix
                .multiply(translationMatrix)
                .multiply(rotationMatrix!)
                .multiply(scalingMatrix)
                .toArray()
        )

        var primitiveType = this.gl.TRIANGLES
        var offset = 0
        var count = 36 //36
        this.gl.drawArrays(primitiveType, offset, count)
    }

    setupCanvas() {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
        this.gl.enable(this.gl.CULL_FACE)
        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.depthFunc(this.gl.LEQUAL)
        this.clearCanvas()
    }

    clearCanvas() {
        this.gl.clearColor(0, 0, 0, 1.0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
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
