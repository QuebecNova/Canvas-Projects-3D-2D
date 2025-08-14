import { evaluate } from 'mathjs'
import { Math } from './Math'

type InitialArguments = { x1: number; y1: number; x2: number; y2: number }

export class Coordinates {
    x1: number // first x coordinate
    y1: number // first y coordinate
    x2: number // second x coordinate
    y2: number // second y coordinate

    dx: number // distance between two x coordinates
    dy: number // distance between two y coordinates

    d: number // distance between two points

    θ1: number //angle with respect to 1 point
    θ2: number //angle with respect to 2 point

    constructor({ x1, y1, x2, y2 }: InitialArguments) {
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
        this.dx = evaluate(`${x2} - ${x1}`)
        this.dy = evaluate(`${y2} - ${y1}`)

        this.d = Math.hypotinuse(this.dx, this.dy)
        this.θ1 = Math.getAngle(this.dx, this.dy)
        this.θ2 = Math.invertAngle(this.θ1)
    }
}
