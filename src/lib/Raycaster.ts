import { Coords } from '@/types/Coords'
import { evaluate } from 'mathjs'
import { Math } from './Math'
import { Singleton } from './Singleton'

type RaycasterOptions = {
    rays: number
    θ: number // angle that raycast will emit rays from
    fieldOfEmission: number
}

type InitialArguments = {
    id: string
    walls?: { from: Coords; to: Coords }[]
    from?: Coords
    rayRadius?: number
    r?: number
    color?: string
    options?: RaycasterOptions
}

export class Raycaster implements Singleton {
    id: string
    private static instances: Raycaster[] = []

    from: Coords
    rayRadius: number
    r: number // radius
    color: string

    walls: { from: Coords; to: Coords }[] = []

    options: RaycasterOptions

    constructor({
        id,
        walls = [],
        from = { x: 0, y: 0 },
        rayRadius = 10000,
        r = 1,
        color = 'white',
        options = {
            rays: 64,
            θ: 0,
            fieldOfEmission: Math.fullRotation,
        },
    }: InitialArguments) {
        this.id = 'raycaster.' + id
        this.from = from
        this.rayRadius = rayRadius
        this.r = r
        this.color = color
        this.options = options
        this.walls = walls

        const raycaster = this.findOne(this.id)
        if (raycaster) {
            raycaster.rayRadius = rayRadius
            return raycaster
        } else {
            Raycaster.instances.push(this)
        }
    }

    emitRays(): { from: Coords; to: Coords; θ: number }[] {
        const rays = []
        const step = this.options.fieldOfEmission / this.options.rays
        for (
            let θ = this.options.θ;
            θ <= this.options.fieldOfEmission + this.options.θ;
            θ += step
        ) {
            const to = { x: 0, y: 0 }
            const deg = Math.convertRadToDeg(θ)
            if (
                deg > 270 ||
                (deg >= -90 && deg < 90) ||
                (deg > 90 && deg < 270)
            ) {
                to.x = evaluate(`cos(${θ})*(${this.rayRadius})`)
            } else if (deg === 90 || deg === 270) {
                to.x = 0
            }
            if (deg > 180 || deg < 180) {
                to.y = evaluate(`sin(${θ})*(${this.rayRadius})`)
            } else if (deg === 0 || deg === 180) {
                to.y = 0
            }
            this.walls.forEach((wall) => {
                const intersection = Math.findIntersection({
                    x1: this.from.x,
                    y1: this.from.y,
                    x2: to.x,
                    y2: to.y,
                    x3: wall.from.x,
                    y3: wall.from.y,
                    x4: wall.to.x,
                    y4: wall.to.y,
                })
                if (intersection) {
                    to.x = intersection.x
                    to.y = intersection.y
                }
            })
            rays.push({ from: this.from, to, θ })
        }
        return rays
    }

    findOne(id: string) {
        return Raycaster.instances.find((inctance) => inctance.id === id)
    }

    static clear() {
        Raycaster.instances = []
    }
}
