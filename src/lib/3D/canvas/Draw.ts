import { getCanvas } from '@/lib/common/getCanvas'

type InitialArguments = {
    canvas: HTMLCanvasElement
    ctx: WebGLRenderingContext
    startDate?: Date
}

export class Draw3D {
    id: string
    canvas: HTMLCanvasElement
    ctx: WebGLRenderingContext
    elapsedTime: number
    private static instances: Draw3D[] = []
    static framerate = 60

    constructor({ canvas, ctx, startDate }: InitialArguments) {
        const newDate = new Date()
        this.elapsedTime =
            (newDate.getTime() - (startDate || newDate).getTime()) / 1000
        this.canvas = canvas
        this.canvas.hidden = false
        this.canvas.height = window.innerHeight - 100
        this.canvas.width = window.innerWidth - 20
        this.ctx = ctx
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
    }

    clearCanvas() {}

    clear() {
        const { canvas } = getCanvas('canvas_3D_main', 'webgl')
        if (canvas) {
            canvas.width = 0
            canvas.height = 0
            canvas.hidden = true
        }
    }

    static findOne(id: string) {
        return Draw3D.instances.find((inctance) => inctance.id === id)
    }
}
