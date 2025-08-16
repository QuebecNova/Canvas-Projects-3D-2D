import { Coords } from '@/types/Coords'
import { abs, cos, evaluate, pi, round, sin } from 'mathjs'
import { blackhole } from '../../entities/blackhole'
import { earth } from '../../entities/earth'
import { ISS } from '../../entities/iss'
import { moon } from '../../entities/moon'
import { venus } from '../../entities/venus'
import { Body } from '../Body'
import { Gravisim } from '../Gravisim'
import { Math } from '../Math'
import { Raycaster } from '../Raycaster'
import { Scene } from '../Scene'
import { Wall } from '../Wall'
import { castValueToRange } from '../helpers/converRange'

type InitialArguments = {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    startDate?: Date
}

type Element = {
    id: string
    from: Coords
    to?: Coords
    r?: number
    color: string
}
export class Draw {
    id: string
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    elapsedTime: number
    renderDistance: number
    zoomFactor = 1
    private static instances: Draw[] = []
    static framerate = 60
    private static elements: Element[] = []

    constructor({ canvas, ctx, startDate }: InitialArguments) {
        const newDate = new Date()
        this.elapsedTime =
            (newDate.getTime() - (startDate || newDate).getTime()) / 1000
        this.canvas = canvas
        this.canvas.height = window.innerHeight - 100
        this.canvas.width = window.innerWidth - 20
        this.ctx = ctx
        this.ctx.strokeStyle = 'white'
        this.renderDistance =
            (this.canvas.width + this.canvas.height) / this.zoomFactor
        this.id = canvas.id
        this.elapsedTime =
            (newDate.getTime() - (startDate || newDate).getTime()) / 1000
        this.setupCanvas()
        const instance = Draw.findOne(this.id)
        if (instance) {
            this.zoomFactor = instance.zoomFactor
            return instance
        } else {
            Draw.instances.push(this)
        }
    }

    setupCanvas() {
        this.clearCanvas()
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
        this.ctx.scale(this.zoomFactor, this.zoomFactor * -1)
    }

    getLineWidth() {
        return (1 / this.zoomFactor) * 2
    }

    circle({
        from: { x, y },
        r,
        color,
    }: {
        from: Coords
        r: number
        color: string
    }) {
        this.ctx.save()
        this.ctx.fillStyle = color
        const bodyPath = new Path2D()
        bodyPath.moveTo(x + r, y)
        bodyPath.arc(x, y, r, 0, Math.fullRotation)
        this.ctx.fill(bodyPath)
        this.ctx.stroke(bodyPath)
        this.ctx.restore()
    }

    wall(x: number, width: number, height: number, brightness: number) {
        this.ctx.save()
        const color = `rgb(${brightness}, ${brightness}, ${brightness})`
        this.ctx.strokeStyle = color
        this.ctx.fillStyle = color
        this.ctx.beginPath()
        this.ctx.rect(x, -(height / 2), width, height)
        this.ctx.fill()
        this.ctx.stroke()

        this.ctx.restore()
    }

    ray(
        from: Coords,
        θ: number = 0,
        length: number = (this.canvas.width * 2) / this.zoomFactor
    ) {
        this.ctx.save()
        this.ctx.strokeStyle = 'white'
        this.ctx.lineWidth = this.getLineWidth()
        this.ctx.beginPath()
        this.ctx.moveTo(from.x, from.y)
        this.ctx.rotate(θ)
        this.ctx.lineTo(length, 0)
        this.ctx.closePath()
        this.ctx.stroke()
        this.ctx.restore()
    }

    line(from: Coords, to: Coords) {
        this.ctx.save()
        this.ctx.strokeStyle = 'white'
        this.ctx.lineWidth = this.getLineWidth()
        this.ctx.beginPath()
        this.ctx.moveTo(from.x, from.y)
        this.ctx.lineTo(to.x, to.y)
        this.ctx.closePath()
        this.ctx.stroke()
        this.ctx.restore()
    }

    bodyVector(magnitude: number, body: Body, θ: number = 0) {
        this.ctx.save()
        this.ctx.strokeStyle = 'darkorange'
        this.ctx.lineWidth = this.getLineWidth()
        this.ctx.beginPath()
        this.ctx.moveTo(body.from.x, body.from.y)
        this.ctx.translate(body.from.x, body.from.y)
        this.ctx.rotate(θ)

        const finalMagnitude =
            body.r * 2 * (magnitude > 3 ? 3 : magnitude < 0.8 ? 0.8 : magnitude)
        const headlen = finalMagnitude / 8 + 20
        const angle = pi / 6

        this.ctx.lineTo(finalMagnitude, 0)
        this.ctx.moveTo(finalMagnitude, 0)

        this.ctx.lineTo(
            finalMagnitude - cos(angle) * headlen,
            -sin(angle) * headlen
        )
        this.ctx.moveTo(finalMagnitude, 0)
        this.ctx.lineTo(
            finalMagnitude - cos(angle) * headlen,
            sin(angle) * headlen
        )

        this.ctx.closePath()
        this.ctx.stroke()
        this.ctx.restore()
    }

    coordinates() {
        this.ctx.save()
        this.ctx.strokeStyle = 'white'
        this.ctx.lineWidth = this.getLineWidth()
        this.ctx.beginPath()
        this.ctx.moveTo(-(this.canvas.width / 2 / this.zoomFactor), 0)
        this.ctx.lineTo(this.canvas.width / 2 / this.zoomFactor, 0)
        this.ctx.closePath()
        this.ctx.stroke()

        this.ctx.beginPath()
        this.ctx.moveTo(0, -(this.canvas.height / 2 / this.zoomFactor))
        this.ctx.lineTo(0, this.canvas.height / 2 / this.zoomFactor)
        this.ctx.closePath()
        this.ctx.stroke()
        this.ctx.restore()
    }

    gravisim() {
        this.canvas.width = window.innerWidth - 20
        this.setupCanvas()
        this.coordinates()
        const bodys = [earth, moon, ISS, venus, blackhole].map((body) => {
            const newBody = Body.randomize(body)
            return new Body(newBody)
        })
        const gravisim = new Gravisim(bodys)

        const GravityForces = gravisim.simulateNBody(1 / Draw.framerate)
        GravityForces.forEach((force) => {
            this.bodyVector(
                evaluate(`${force.F}/${bodys[force.n1].m}`),
                bodys[force.n1],
                force.θ1
            )
            this.bodyVector(
                evaluate(`${force.F}/${bodys[force.n2].m}`),
                bodys[force.n2],
                force.θ2
            )
        })
        bodys.forEach((body) => {
            const element = Draw.findOneById(body.id)

            if (!element) {
                Draw.elements.push(body)
            }
            this.circle(body)
        })
        this.addMouseMove()
    }

    raycasting() {
        this.canvas.width = this.canvas.width / 2
        this.setupCanvas()
        const { raycaster } = new Scene({
            renderDistance: this.renderDistance,
            width: this.canvas.width,
            height: this.canvas.height,
            fov: pi / 2,
        })

        raycaster.walls.forEach((wall) => {
            this.line(wall.from, wall.to)
        })

        this.circle(raycaster)

        raycaster.rays.forEach((ray) => {
            this.line(ray.from, ray.to)
        })

        const reycasterElement = Draw.findOneById(raycaster.id)
        if (!reycasterElement) {
            Draw.elements.push(raycaster as Element)
        }

        this.addMouseMove()
        this.addMovementKeys(raycaster)
    }

    scene(raycaster: Raycaster) {
        this.canvas.width = this.canvas.width / 2
        this.setupCanvas()
        const rays = raycaster.rays
        const step = this.canvas.width / rays.length
        let rayIndex = 0

        const dMinMax = { min: 0, max: this.canvas.height }
        for (
            let i = this.canvas.width / 2;
            i >= -(this.canvas.width / 2);
            i -= step
        ) {
            const ray = rays[rayIndex]
            if (ray && ray.isIntersect) {
                const θ =
                    ray.θ -
                    (raycaster.options.θ +
                        raycaster.options.fieldOfEmission / 2)
                const d = abs(cos(θ) * ray.d)
                const brightness =
                    220 -
                    round(castValueToRange(d, dMinMax, { min: 0, max: 180 }))
                const height =
                    this.canvas.height -
                    castValueToRange(d, dMinMax, {
                        min: 0,
                        max: this.canvas.height,
                    })
                this.wall(i - step, step, height <= 0 ? 0 : height, brightness)
            }
            rayIndex++
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    addMouseMove() {
        this.canvas.onmousedown = (e) => {
            const { x, y } = this.getMousePos(e)
            const element = Draw.findOneCircleByMousePosition({ x, y }, this)
            if (!element) return
            const xDiff = x - element.from.x
            const yDiff = y - element.from.y
            this.canvas.onmousemove = (e) => {
                const { x, y } = this.getMousePos(e)
                element.from = {
                    x: x - xDiff,
                    y: y - yDiff,
                }
            }
        }
        this.canvas.onmouseup = () => {
            this.canvas.onmousemove = null
        }
    }

    getMousePos({ offsetX, offsetY }: { offsetX: number; offsetY: number }) {
        const x = (offsetX - this.canvas.width / 2) / this.zoomFactor
        const y = (this.canvas.height / 2 - offsetY) / this.zoomFactor
        return { x, y }
    }

    addMovementKeys(raycaster: Raycaster) {
        document.onkeydown = (e) => {
            const element = Draw.findOneById(raycaster.id)
            if (e.code === 'KeyE') {
                raycaster.rotate(-(pi / 32))
            }
            if (e.code === 'KeyQ') {
                raycaster.rotate(pi / 32)
            }
            const θ =
                raycaster.options.fieldOfEmission / 2 + raycaster.options.θ
            const cosθ = cos(θ)
            const sinθ = sin(θ)
            if (element) {
                if (e.code === 'KeyW') {
                    raycaster.from.x += cosθ * 3
                    element.from.x += cosθ * 3
                    raycaster.from.y += sinθ * 3
                    element.from.y += sinθ * 3
                }
                if (e.code === 'KeyS') {
                    raycaster.from.x -= cosθ * 3
                    element.from.x -= cosθ * 3
                    raycaster.from.y -= sinθ * 3
                    element.from.y -= sinθ * 3
                }
                if (e.code === 'KeyD') {
                    const moveθ = Math.formatAngle(
                        raycaster.options.fieldOfEmission / 2 +
                            raycaster.options.θ -
                            pi / 2
                    )
                    raycaster.from.x += cos(moveθ) * 3
                    element.from.x += cos(moveθ) * 3
                    raycaster.from.y += sin(moveθ) * 3
                    element.from.y += sin(moveθ) * 3
                }
                if (e.code === 'KeyA') {
                    const moveθ = Math.formatAngle(
                        raycaster.options.fieldOfEmission / 2 +
                            raycaster.options.θ +
                            pi / 2
                    )
                    raycaster.from.x += cos(moveθ) * 3
                    element.from.x += cos(moveθ) * 3
                    raycaster.from.y += sin(moveθ) * 3
                    element.from.y += sin(moveθ) * 3
                }
            }
        }
        // this.canvas.onkeyup = () => {
        // this.canvas.onmousemove = null
        // }
    }

    static findOneById(id: string) {
        return Draw.elements.find((element) => element.id === id)
    }

    static findOneCircleByMousePosition({ x, y }: Coords, draw: Draw) {
        return Draw.elements.find((element) => {
            if (!element.r) return
            const d = element.r + draw.getLineWidth()
            const xDiff = x - element.from.x
            const yDiff = y - element.from.y
            return xDiff >= -d && xDiff <= d && yDiff >= -d && yDiff <= d
        })
    }

    addZoom() {
        this.canvas.onwheel = (e) => {
            e.preventDefault()
            const instance = Draw.findOne(this.id)
            if (instance) {
                const factor = instance.zoomFactor
                this.zoomFactor = factor + (factor * e.deltaY * -1) / 1000
                instance.zoomFactor = this.zoomFactor
                this.renderDistance =
                    (this.canvas.width + this.canvas.height) / this.zoomFactor
            }
        }
    }

    static clear() {
        Raycaster.clear()
        Wall.clear()
        Body.clear()
        Draw.elements = []
        Scene.clear()
    }

    static findOne(id: string) {
        return Draw.instances.find((inctance) => inctance.id === id)
    }
}
