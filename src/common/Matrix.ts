//This class defines a Matrix data type and it's operations

import { evaluate } from 'mathjs'
import { ErrorHandler } from './Error'
import { Vector } from './Vector'

export class Matrix extends Array<Array<number>> {
    constructor(M: number[][]) {
        super(...M)
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

        const result = Matrix.getSquareMatrix(this.length)

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

    // https://en.wikipedia.org/wiki/Gaussian_elimination
    //NOTE: Use only with square matrices
    // Complexity is O(n! + n^3), due to determinant calculation
    // Just don't use it with very large matrices
    // In this project I use it only for up to 4x4 matrix, so I should be ok (no)...
    invert(): Matrix | null {
        if (this.length !== this[0]?.length) {
            ErrorHandler.log(
                `Don't use on a non-square matrix (rows length: ${this.length}, columns length: ${this[0]?.length || 0}`
            )
            return null
        }
        const A = this
        const I = Matrix.getIdentityMatrix(this.length)

        const AI = A.augmentWith(I)
        let eliminatedAI = AI

        const det = this.determinant()
        if (det === 0) return null

        this.eliminate(AI, 0, (result) => {
            eliminatedAI = result
        })

        const AInverted = Matrix.getSquareMatrix(this.length)
        eliminatedAI.forEach((row, rowI) =>
            row.forEach((el, col) => {
                if (col < this.length) return
                AInverted[rowI][col - this.length] = el
            })
        )

        return AInverted
    }

    private eliminate(
        AI: Matrix,
        workingPivotI: number,
        onFinish: (eliminatedAI: Matrix) => any
    ): void {
        const newAI = Matrix.getCopy(AI)

        for (let pivotI = workingPivotI; pivotI < newAI.length; pivotI++) {
            const pivotRow = newAI[pivotI]
            const pivotEl = pivotRow[pivotI]
            if (pivotEl === 1) {
                for (let otherRowI = 0; otherRowI < newAI.length; otherRowI++) {
                    const otherRow = newAI[otherRowI]
                    const belowPivotEl = otherRow[pivotI]
                    if (belowPivotEl === 0 || otherRowI === pivotI) continue

                    const newOtherRow = otherRow.map(
                        (otherRowEl, otherRowI) => {
                            return evaluate(
                                `${otherRowEl} - (${pivotRow[otherRowI]} * ${belowPivotEl})`
                            )
                        }
                    )

                    newAI[otherRowI] = newOtherRow
                }
                workingPivotI++
                if (workingPivotI >= newAI.length) {
                    onFinish(newAI)
                    break
                } else {
                    this.eliminate(newAI, workingPivotI, onFinish)
                    break
                }
            } else if (pivotEl !== 0) {
                const newPivotRow = pivotRow.map((el) => el / pivotEl)
                newAI[pivotI] = newPivotRow
                this.eliminate(newAI, workingPivotI, onFinish)
                break
            } else if (pivotEl === 0) {
                // Add from other rows to current row
                for (let otherRowI = 0; otherRowI < newAI.length; otherRowI++) {
                    const otherRow = newAI[otherRowI]
                    const belowPivotEl = otherRow[pivotI]
                    if (belowPivotEl === 0 || otherRowI === pivotI) continue

                    const newPivotRow = pivotRow.map(
                        (somePivotEl, pivotCol) => {
                            return evaluate(
                                `${somePivotEl} + (${otherRow[pivotCol]} / ${belowPivotEl})`
                            )
                        }
                    )

                    newAI[pivotI] = newPivotRow
                    this.eliminate(newAI, workingPivotI, onFinish)
                    break
                }
            }
        }
    }

    // https://en.wikipedia.org/wiki/Laplace_expansion
    //NOTE: Use only with square matrices
    //TODO: Complexity is O(n!), can be improved to O(n^3) with diagonalization
    // Just don't use it with very large matrices
    determinant() {
        let determinant = 0
        if (this.length !== this[0]?.length) {
            ErrorHandler.log(
                `Don't use on a non-square matrix (rows length: ${this.length}, columns length: ${this[0]?.length || 0}`
            )
            return determinant
        }
        let matrices: Matrix[] = [this]
        const createMatrices = (matrices: Matrix[] = []) => {
            const newMatrices: Matrix[] = []
            matrices.forEach((m) => {
                const firstRow = m[0]
                firstRow.forEach((firstRowEl, firstRowCol) => {
                    const matrix = new Matrix([])
                    m.forEach((row, rowI) => {
                        if (rowI === 0) return
                        const newRow: number[] = []
                        row.forEach((rowEl, col) => {
                            if (col === firstRowCol) return
                            const newEl =
                                rowI === 1
                                    ? evaluate(`${rowEl * firstRowEl}`)
                                    : rowEl
                            newRow.push(
                                firstRowCol % 2 && rowI === 1 ? -newEl : newEl
                            )
                        })
                        matrix.push(newRow)
                    })
                    newMatrices.push(matrix)
                })
            })
            if (newMatrices.length < 20 && newMatrices[0]?.length > 2) {
                return createMatrices(newMatrices)
            } else {
                return newMatrices
            }
        }
        if (this.length > 2) {
            matrices = createMatrices([this])
            matrices.forEach((m) => {
                determinant = evaluate(`${determinant} + ${Matrix.det2x2(m)}`)
            })
        } else if (this.length <= 2) {
            if (this.length === 1) {
                determinant = evaluate(`${determinant} + ${this[0][0]}`)
            } else {
                determinant = evaluate(
                    `${determinant} + ${Matrix.det2x2(this)}`
                )
            }
        }

        return determinant
    }

    private static det2x2(m: Matrix) {
        return evaluate(`${m[0][0]}*${m[1][1]} - ${m[0][1]}*${m[1][0]}`)
    }

    augmentWith(M2: Matrix) {
        const M1 = this
        const M1M2 = new Matrix([])
        M1.forEach((row, i) => (M1M2[i] = row.concat(M2[i])))
        return M1M2
    }

    static getCopy(m: Matrix) {
        const copy = new Matrix([])
        m.forEach((row) => {
            copy.push([...row])
        })
        return copy
    }

    static getIdentityMatrix(length: number) {
        return new Matrix(
            new Array(length)
                .fill(0)
                .map((_, index) =>
                    new Array(length)
                        .fill(0)
                        .map((__, index2) => (index === index2 ? 1 : 0))
                )
        )
    }

    static getSquareMatrix(length: number, fill: number = 0) {
        return new Matrix(
            new Array(length).fill(0).map(() => new Array(length).fill(fill))
        )
    }
}
