//This class defines a Matrix data type and it's operations

import { evaluate } from 'mathjs'
import { ErrorHandler } from './Error'
import { Vector } from './Vector'

export class Matrix extends Array<Array<number>> {
    constructor(m1: number[][]) {
        super(...m1)
    }

    toArray(): number[] {
        const arr: number[] = []
        this.forEach((mArr) => {
            mArr.forEach((n) => arr.push(n))
        })
        return arr
    }

    //TODO: Modify to allow to use when m1.length > m2.length
    //NOTE: Works only if m1.length >= m2.length (Square matrices or if you do 3x2*2x3 matrices, but not 2x3*3x2)
    multiply(m2: Matrix): Matrix {
        if (this.length < m2.length) {
            ErrorHandler.log(
                `Don't pass a matrix which m1.length < m2.length (${this.length} < ${m2.length})`
            )
        }

        const result = new Matrix(
            new Array(this.length)
                .fill(0)
                .map(() => new Array(this.length).fill(0))
        )

        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < this.length; j++) {
                for (let k = 0; k < m2.length; k++) {
                    result[i][j] = evaluate(
                        `${result[i][j]} + ${this[i][k]} * ${m2[k][j]}`
                    )
                }
            }
        }

        return result
    }

    multiplyByVector(vector: Vector) {
        const result: number[] = new Array(this.length).fill(0)
        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < this.length; j++) {
                result[i] = evaluate(
                    `${result[i]} + ${vector[j]} * ${this[j][i]}`
                )
            }
        }
        return result
    }
}
