import { pi } from 'mathjs'
import { Raycaster } from './Raycaster'
import { Wall } from './Wall'
import { Draw } from './canvas/Draw'

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

        const { canvas, ctx } = Scene.getCanvas()
        if (!canvas || !ctx) return
        ctx.save()

        const draw = new Draw({ canvas, ctx })
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

    private static getCanvas() {
        const canvas = document.getElementById(
            'canvas_scene'
        ) as HTMLCanvasElement
        if (!canvas) return {}
        const ctx = canvas.getContext('2d')
        if (!ctx) return {}

        return { ctx, canvas }
    }

    static clear() {
        const { canvas } = Scene.getCanvas()
        if (!canvas) return
        canvas.width = 0
        canvas.height = 0
    }
}
