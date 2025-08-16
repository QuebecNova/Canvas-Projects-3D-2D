import { Coords } from '@/types/Coords'
import { cos, evaluate, pi, sin } from 'mathjs'
import { blackhole } from '../../entities/blackhole'
import { earth } from '../../entities/earth'
import { ISS } from '../../entities/iss'
import { moon } from '../../entities/moon'
import { venus } from '../../entities/venus'
import { Body } from '../Body'
import { Gravisim } from '../Gravisim'
import { Math } from '../Math'
import { Raycaster } from '../Raycaster'
import { Wall } from '../Wall'

type InitialArguments = {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    startDate: Date
}

type Element = {
    id: string
    from: Coords
    to?: Coords
    r?: number
    color: string
}
export class Draw {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    elapsedTime: number
    renderDistance: number
    static framerate = 60
    static zoomFactor = 1.5
    private static elements: Element[] = []

    constructor({ canvas, ctx, startDate }: InitialArguments) {
        const newDate = new Date()
        this.elapsedTime = (newDate.getTime() - startDate.getTime()) / 1000
        this.canvas = canvas
        this.canvas.height = window.innerHeight - 100
        this.canvas.width = window.innerWidth - 20
        this.ctx = ctx
        this.ctx.strokeStyle = 'white'
        this.renderDistance =
            (this.canvas.width + this.canvas.height) / Draw.zoomFactor
        this.clearCanvas()
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
        this.ctx.scale(Draw.zoomFactor, Draw.zoomFactor * -1)
    }

    static getLineWidth() {
        return (1 / Draw.zoomFactor) * 2
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

    ray(
        from: Coords,
        θ: number = 0,
        length: number = (this.canvas.width * 2) / Draw.zoomFactor
    ) {
        this.ctx.save()
        this.ctx.strokeStyle = 'white'
        this.ctx.lineWidth = Draw.getLineWidth()
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
        this.ctx.lineWidth = Draw.getLineWidth()
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
        this.ctx.lineWidth = Draw.getLineWidth()
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
        this.ctx.lineWidth = Draw.getLineWidth()
        this.ctx.beginPath()
        this.ctx.moveTo(-(this.canvas.width / 2 / Draw.zoomFactor), 0)
        this.ctx.lineTo(this.canvas.width / 2 / Draw.zoomFactor, 0)
        this.ctx.closePath()
        this.ctx.stroke()

        this.ctx.beginPath()
        this.ctx.moveTo(0, -(this.canvas.height / 2 / Draw.zoomFactor))
        this.ctx.lineTo(0, this.canvas.height / 2 / Draw.zoomFactor)
        this.ctx.closePath()
        this.ctx.stroke()
        this.ctx.restore()
    }

    gravisim() {
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
        const walls = [
            new Wall({
                id: '1',
                from: { x: -100, y: -550 },
                to: { x: 200, y: 150 },
            }),
            new Wall({
                id: '2',
                from: { x: 200, y: -100 },
                to: { x: 150, y: 250 },
            }),
            new Wall({
                id: '3',
                from: { x: -200, y: 150 },
                to: { x: 300, y: 150 },
            }),
            new Wall({
                id: '4',
                from: { x: -300, y: -50 },
                to: { x: -300, y: -250 },
            }),
        ]
        walls.forEach((wall) => {
            this.line(wall.from, wall.to)
        })

        const raycaster = new Raycaster({
            from: { x: 0, y: 0 },
            rayRadius: this.renderDistance,
            id: '1',
            r: 10,
            walls,
            options: {
                rays: 50,
                θ: 0,
                fieldOfEmission: pi * 2,
            },
        })
        this.circle(raycaster)

        const rays = raycaster.emitRays()
        rays.forEach((ray) => {
            this.line(ray.from, ray.to)
        })

        const reycasterElement = Draw.findOneById(raycaster.id)
        if (!reycasterElement) {
            Draw.elements.push(raycaster as Element)
        }

        this.addMouseMove()
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    addMouseMove() {
        this.canvas.onmousedown = (e) => {
            const { x, y } = this.getMousePos(e)
            const element = Draw.findOneCircleByMousePosition({ x, y })
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
        const x = (offsetX - this.canvas.width / 2) / Draw.zoomFactor
        const y = (this.canvas.height / 2 - offsetY) / Draw.zoomFactor
        return { x, y }
    }

    static findOneById(id: string) {
        return Draw.elements.find((element) => element.id === id)
    }

    static findOneCircleByMousePosition({ x, y }: Coords) {
        return Draw.elements.find((element) => {
            if (!element.r) return
            const d = element.r + Draw.getLineWidth()
            const xDiff = x - element.from.x
            const yDiff = y - element.from.y
            return xDiff >= -d && xDiff <= d && yDiff >= -d && yDiff <= d
        })
    }

    static addZoom(canvas: HTMLCanvasElement) {
        canvas.onwheel = (e) => {
            e.preventDefault()
            const factor = Draw.zoomFactor
            Draw.zoomFactor = factor + (factor * e.deltaY * -1) / 1000
        }
    }

    static clear() {
        Raycaster.clear()
        Wall.clear()
        Body.clear()
        Draw.elements = []
    }
}
