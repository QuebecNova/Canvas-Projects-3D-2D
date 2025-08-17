import { evaluate } from 'mathjs'
const realG = evaluate(`6.67430*10^(-11)`)
export class Gravity {
    static G = 1

    static getForce(m1: number, m2: number, r: number) {
        if (r === 0) return 0
        let F = evaluate(`${Gravity.G}*${m1}*${m2} / ((${r}^2))`)
        if (F?.re) {
            F = 0
        }
        return F
    }

    static getAcceleration(m: number, r: number) {
        if (r === 0) return 0
        let a = evaluate(`${Gravity.G}*${m} / ((${r})^2)`)
        if (a?.re) {
            a = 0
        }
        return a
    }
}
