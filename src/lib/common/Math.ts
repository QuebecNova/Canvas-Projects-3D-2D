import { Coords } from '@/types/Coords'
import { evaluate, pi } from 'mathjs'

type FourCoords = {
    x1: number
    y1: number
    x2: number
    y2: number
    x3: number
    y3: number
    x4: number
    y4: number
}

type TwoCoords = {
    x1: number
    y1: number
    x2: number
    y2: number
}

class MyMath {
    static fullRotation = pi * 2
    static maxV = 30

    static getAngle(x: number, y: number): number {
        if (x === 0 && y >= 0) return MyMath.formatAngle(0)
        if (x === 0 && y < 0) return MyMath.formatAngle(Math.PI)
        const θ = evaluate(`atan(${y} / ${x}) + ${x < 0 ? pi : 0}`)
        return MyMath.formatAngle(θ)
    }

    static invertAngle(θ: number) {
        const θ1 = evaluate(`${θ}+${pi}`)
        return MyMath.formatAngle(θ1)
    }

    static formatAngle(θ: number) {
        const turns = Math.trunc(evaluate(`${θ} / ${MyMath.fullRotation}`))
        let θ1 = evaluate(`${θ} - (${MyMath.fullRotation} * ${turns})`)
        if (θ1 < 0) {
            θ1 += pi * 2
        }
        return θ1
    }

    static boundToPlane(θ: number) {
        const turns = Math.trunc(evaluate(`${θ} / ${MyMath.fullRotation}`))
        let θ1 = evaluate(`${θ} - (${MyMath.fullRotation} * ${turns})`)
        if (θ1 < 0) {
            θ1 += pi * 2
        }
        return θ1
    }

    static boundToStraightAngle(θ: number): number {
        θ = MyMath.formatAngle(θ)
        const deg = MyMath.convertRadToDeg(θ)
        if (deg < 90) return θ
        if (deg < 180 && deg >= 90) return evaluate(`${θ} - (${pi}/2)`)
        if (deg < 270 && deg >= 180) return evaluate(`${θ} - ${pi}`)
        if (deg >= 270) return evaluate(`${θ} - (3/2*${pi})`)
        return θ
    }

    static hypotinuse(x: number, y: number): number {
        const d = evaluate(`sqrt((${x})^2 + (${y})^2)`)

        return d
    }

    static convertDegToRad(deg: number) {
        return evaluate(`${deg} / 57.2958`)
    }

    static convertRadToDeg(rad: number) {
        return evaluate(`${rad} * 57.2958`)
    }

    static convertPolarToCartesian(r: number, θ: number): [number, number] {
        const x = evaluate(`cos(${θ})*${r}`)
        const y = evaluate(`sin(${θ})*${r}`)

        return [x, y]
    }

    static getDistance({ x1, y1, x2, y2 }: TwoCoords) {
        const dx = evaluate(`${x2} - ${x1}`)
        const dy = evaluate(`${y2} - ${y1}`)

        return MyMath.hypotinuse(dx, dy)
    }

    static getViewAngle({ x1, y1, x2, y2 }: TwoCoords) {
        const dx = evaluate(`${x2} - ${x1}`)
        const dy = evaluate(`${y2} - ${y1}`)

        const θ1 = MyMath.getAngle(dx, dy)
        const θ2 = MyMath.invertAngle(θ1)
        return { θ1, θ2 }
    }

    static findIntersection({
        x1, // first line segment from
        y1, // first line segment from
        x2, // first line segment to
        y2, // first line segment to
        x3, // second line segment from
        y3, // second line segment from
        x4, // second line segment to
        y4, // second line segment to
    }: FourCoords): Coords | null {
        const denominator = evaluate(
            `(${x1} - ${x2})(${y3}-${y4})-(${y1}-${y2})(${x3}-${x4})`
        )
        if (!denominator) return null

        const tNumerator = evaluate(
            `(${x1} - ${x3})(${y3}-${y4})-(${y1}-${y3})(${x3}-${x4})`
        )
        const uNumerator = evaluate(
            `(${x1} - ${x2})(${y1}-${y3})-(${y1}-${y2})(${x1}-${x3})`
        )
        const t = evaluate(`${tNumerator}/${denominator}`)
        const u = evaluate(`-(${uNumerator}/${denominator})`)
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            //Intersection
            const x = evaluate(`${x1}+${t}*(${x2}-${x1})`)
            const y = evaluate(`${y1}+${t}*(${y2}-${y1})`)

            return { x, y }
        } else {
            return null
        }
    }
}

export { MyMath as Math }
