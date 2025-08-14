import { evaluate, pi } from 'mathjs'

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
        const θ1 = evaluate(`${θ} - (${MyMath.fullRotation} * ${turns})`)
        return θ1
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
}

export { MyMath as Math }
