import { Math } from '@/lib/common/Math'
import { Coords } from '@/types/Coords'

type InitialArguments = {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    startDate?: Date
}

export class Draw3D {
    id: string
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    elapsedTime: number
    readonly zoomFactor = 1
    private static instances: Draw3D[] = []
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
        this.id = canvas.id
        this.setupCanvas()
        const instance = Draw3D.findOne(this.id)
        if (instance) {
            return instance
        } else {
            Draw3D.instances.push(this)
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

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    static clear() {}

    static findOne(id: string) {
        return Draw3D.instances.find((inctance) => inctance.id === id)
    }
}
