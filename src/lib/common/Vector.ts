//This class defines a Vector data type and it's operations

import { Matrix } from '@/lib/common/Matrix'
import { evaluate } from 'mathjs'

export class Vector extends Array<number> {
    constructor(...args: number[]) {
        super(...args)
    }

    multiplyByMatrix(matrix: Matrix) {
        const result: number[] = new Array(this.length).fill(0)
        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < this.length; j++) {
                result[i] = evaluate(
                    `${result[i]} + ${this[j]} * ${matrix[j][i]}`
                )
            }
        }
        return result
    }
}
