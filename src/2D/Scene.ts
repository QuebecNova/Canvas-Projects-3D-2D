import { Draw2D } from '@/2D/canvas/Draw'
import { pi } from 'mathjs'
import { getCanvas } from '../common/getCanvas'
import { Raycaster } from './Raycaster'
import { Wall } from './Wall'

export class Scene {
    renderDistance: number
    width: number
    height: number
    raycaster: Raycaster
    fov: number
    constructor({
        renderDistance,
        width,
        height,
        fov = pi * 2,
    }: {
        renderDistance: number
        width: number
        height: number
        fov?: number
    }) {
        this.renderDistance = renderDistance
        this.width = width
        this.height = height
        this.fov = fov
        this.raycaster = this.setup().raycaster

        const { canvas, ctx } = getCanvas('canvas_2D_secondary', '2d')
        if (!canvas || !ctx) return
        canvas.hidden = false
        ctx.save()

        const draw = new Draw2D({ canvas, ctx })
        draw.scene(this.raycaster)
    }
    setup() {
        const walls = Wall.random(this.width / 2, this.height / 2, 8)

        const raycaster = new Raycaster({
            from: { x: 0, y: 0 },
            rayRadius: this.renderDistance,
            id: '1',
            r: 10,
            walls,
            options: {
                rays: 100,
                θ: 0,
                fieldOfEmission: this.fov,
            },
        })

        raycaster.emitRays()

        return { raycaster }
    }

    static clear() {
        const { canvas } = getCanvas('canvas_2D_secondary', '2d')
        if (!canvas) return
        canvas.width = 0
        canvas.height = 0
        canvas.hidden = true
    }
}
