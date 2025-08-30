import { Math } from '@/common/Math'
import { Body } from './Body'
import { Gravity } from './Gravity'

type GravityForce = {
    n1: number
    n2: number
    F: number
    θ1: number
    θ2: number
}

export class Gravisim {
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
                const {
                    from: { x: x1, y: y1 },
                } = body1
                const {
                    from: { x: x2, y: y2 },
                } = body2
                const d = Math.getDistance({ x1, y1, x2, y2 })
                const { θ1, θ2 } = Math.getViewAngle({ x1, y1, x2, y2 })
                const F = Gravity.getForce(body1.m, body2.m, d)
                body1.applyForce(F, θ1)
                body1.move(t)
                Forces.push({ n1: index1, n2: index2, F, θ1, θ2 })
            })
        })
        return Forces
    }
}
