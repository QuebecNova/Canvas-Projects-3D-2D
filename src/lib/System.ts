import { Body } from './Body'
import { Coordinates } from './Coordinates'
import { Gravity } from './Gravity'

type GravityForce = {
    n1: number
    n2: number
    F: number
    coordinates: Coordinates
}

export class System {
    bodys: Body[]
    constructor(bodys: Body[]) {
        this.bodys = bodys
    }

    simulateNBody(t: number) {
        if (this.bodys.length < 2) return []
        const Forces: GravityForce[] = []
        this.bodys.forEach((body1, index1) => {
            this.bodys.forEach((body2, index2) => {
                if (index1 === index2) return
                const coordinates = new Coordinates({
                    x1: body1.x,
                    x2: body2.x,
                    y1: body1.y,
                    y2: body2.y,
                })
                const F = Gravity.getForce(body1.m, body2.m, coordinates.d)
                body1.applyForce(F, coordinates.θ1)
                body1.move(t)
                Forces.push({ n1: index1, n2: index2, F, coordinates })
            })
        })
        return Forces
    }
}
