import { Coords } from '@/types/Coords'
import { abs, evaluate, pi, random } from 'mathjs'
import { Math } from './Math'
import { Singleton } from './Singleton'
import { randColor } from './helpers/randColor'

type InitialArguments = {
    id: string
    x: number
    y: number
    v?: number
    a?: number
    m: number
    aθ?: number
    vθ?: number
    r?: number
    color?: string
}

export class Body implements Singleton {
    id: string
    private static instances: Body[] = []
    from: Coords
    v: number // velocity (px/s)
    vx: number // velocity in x
    vy: number // velocity in y
    vθ: number // angle of velocity
    a: number // acceleration (px/s^2)
    aθ: number // angle of acceleration
    ax: number // acceleration in x
    ay: number // acceleration in y
    m: number // mass
    r: number // radius
    color: string
    constructor({
        id,
        x,
        y,
        v = 0,
        a = 0,
        m,
        vθ = 0,
        aθ = 0,
        r = 1,
        color = 'white',
    }: InitialArguments) {
        this.id = id
        this.from = {
            x,
            y,
        }
        this.v = v
        this.a = a
        this.m = m
        this.r = r
        this.vθ = vθ
        this.aθ = aθ

        const [vx, vy] = Math.convertPolarToCartesian(v, vθ)
        this.vx = vx
        this.vy = vy

        const [ax, ay] = Math.convertPolarToCartesian(a, aθ)
        this.ax = ax
        this.ay = ay

        this.color = color

        const body = this.findOne(this.id)

        if (body) {
            return body
        } else {
            Body.instances.push(this)
        }
    }

    move(t: number) {
        this.changeVelocity(t)
        this.changePosition(t)
    }

    private changePosition(t: number): { x: number; y: number } {
        const x = evaluate(
            `${this.from.x} + ${this.vx}*${t} + 1/2*${this.ax}*(${t})^2`
        )
        const y = evaluate(
            `${this.from.y} + ${this.vy}*${t} + 1/2*${this.ay}*(${t})^2`
        )

        this.from.x = x
        this.from.y = y

        return { x, y }
    }

    private changeVelocity(t: number): { vx: number; vy: number; v: number } {
        const vx = evaluate(`${this.vx} + ${this.ax}*${t}`)
        const vy = evaluate(`${this.vy} + ${this.ay}*${t}`)
        const v = Math.hypotinuse(vx, vy)

        this.vx = vx
        this.vy = vy
        this.v = v

        return { vx, vy, v }
    }

    applyForce(F: number, θ: number): { ax: number; ay: number; a: number } {
        if (this.m === 0) {
            return { ax: this.ax, ay: this.ay, a: this.a }
        }
        const a = evaluate(`${F}/${this.m}`)
        const [ax, ay] = Math.convertPolarToCartesian(a, θ)

        this.ax = ax
        this.ay = ay
        this.a = a
        this.aθ = θ

        return { ax, ay, a }
    }

    findOne(id: string) {
        return Body.instances.find((inctance) => inctance.id === id)
    }

    static randomize(body: InitialArguments) {
        const factor = random(-2, 2)
        const deg = random(0, pi * 2)
        const rFactor = random(0.8, 2)
        const copy = { ...body }
        copy.x = body.x * factor
        copy.y = body.y * factor
        if (body.v) {
            copy.v = body.v * abs(factor)
        }
        copy.m = body.m * abs(factor)
        if (body.r) {
            copy.r = body.r * rFactor
        }
        if (body.color) {
            copy.color = randColor()
        }
        copy.vθ = deg
        return copy
    }

    static clear() {
        Body.instances = []
    }
}
