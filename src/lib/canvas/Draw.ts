import { Body } from '../Body'
import { Math } from '../Math'

type InitialArguments = {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
}

export class Draw {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    static zoom = { x: 0.2, y: 0.2 }

    constructor({ canvas, ctx }: InitialArguments) {
        this.canvas = canvas
        this.ctx = ctx

        this.ctx.strokeStyle = 'white'

        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
        this.ctx.scale(Draw.zoom.x, Draw.zoom.y * -1)
    }

    static getLineWidth() {
        return 1 / Draw.zoom.x
    }

    body(body: Body) {
        this.ctx.save()
        this.ctx.fillStyle = body.color
        const bodyPath = new Path2D()
        bodyPath.moveTo(body.x + body.r, body.y)
        bodyPath.arc(body.x, body.y, body.r, 0, Math.fullRotation)
        this.ctx.fill(bodyPath)
        this.ctx.stroke(bodyPath)
        this.ctx.restore()
    }

    bodyVector(magnitude: number, body: Body, θ: number = 0) {
        this.ctx.save()
        this.ctx.strokeStyle = 'darkorange'
        this.ctx.lineWidth = Draw.getLineWidth() * 4
        this.ctx.beginPath()
        this.ctx.moveTo(body.x, body.y)
        this.ctx.translate(body.x, body.y)
        this.ctx.rotate(θ)
        const finalMagnitude =
            body.r * 2 * (magnitude > 3 ? 3 : magnitude < 0.8 ? 0.8 : magnitude)
        this.ctx.lineTo(finalMagnitude, 0)
        this.ctx.closePath()
        this.ctx.stroke()
        this.ctx.restore()
    }

    coordinates() {
        this.ctx.save()
        this.ctx.lineWidth = Draw.getLineWidth()
        this.ctx.beginPath()
        this.ctx.moveTo(-(this.canvas.width / 2 / Draw.zoom.x), 0)
        this.ctx.lineTo(this.canvas.width / 2 / Draw.zoom.x, 0)
        this.ctx.closePath()
        this.ctx.stroke()

        this.ctx.beginPath()
        this.ctx.moveTo(0, -(this.canvas.height / 2 / Draw.zoom.y))
        this.ctx.lineTo(0, this.canvas.height / 2 / Draw.zoom.y)
        this.ctx.closePath()
        this.ctx.stroke()
        this.ctx.restore()
    }

    static addZoom(canvas: HTMLCanvasElement) {
        canvas.onwheel = (e) => {
            e.preventDefault()
            const zoomFactor = Draw.zoom.x
            Draw.zoom.x = Draw.zoom.x + (zoomFactor * e.deltaY * -1) / 1000
            Draw.zoom.y = Draw.zoom.y + (zoomFactor * e.deltaY * -1) / 1000
        }
    }
}
