//This class defines a Vector data type and it's operations

import { Matrix } from '@/common/Matrix'
import { evaluate } from 'mathjs'
import { ErrorHandler } from './Error'

export class Vector extends Array<number> {
    constructor(...args: number[]) {
        super(...args)
    }

    multiplyByMatrix(matrix: Matrix) {
        const result: number[] = new Array(this.length).fill(0)
        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < this.length; j++) {
                result[i] = evaluate(`${result[i]} + ${this[j]} * ${matrix[j][i]}`)
            }
        }
        return result
    }

    dot(vec: Vector) {
        if (this.length > vec.length) {
            throw ErrorHandler.throw(`Use the vectors that are vec1 <= vec2, vec1:${this.length} vec2:${vec.length}`)
        }
        let result = 0
        for (let i = 0; i < this.length; i++) {
            result += this[i] * vec[i]
        }
        return result
    }
}
