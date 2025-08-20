import { Matrix } from '../Matrix'
import { Vector } from '../Vector'

const tolerance = 1e-10 // For floating point precision

describe('Matrix multiplication', () => {
    test('2x2 * 2x2', () => {
        const m1 = new Matrix([
            [1, 2],
            [2, 3],
        ])
        const m2 = new Matrix([
            [2, 4],
            [6, 7],
        ])
        const result = m1.multiply(m2)
        expect(result[0][0]).toBeCloseTo(14, tolerance)
        expect(result[0][1]).toBeCloseTo(18, tolerance)
        expect(result[1][0]).toBeCloseTo(22, tolerance)
        expect(result[1][1]).toBeCloseTo(29, tolerance)
    })

    test('3x3 * 3x3', () => {
        const m1 = new Matrix([
            [1, 2, 3],
            [2, 3, 4],
            [3, 4, 5],
        ])
        const m2 = new Matrix([
            [2, 3, 4],
            [5, 6, 7],
            [8, 9, 10],
        ])
        const result = m1.multiply(m2)
        expect(result[0][0]).toBeCloseTo(36, tolerance)
        expect(result[0][1]).toBeCloseTo(42, tolerance)
        expect(result[0][2]).toBeCloseTo(48, tolerance)
        expect(result[1][0]).toBeCloseTo(51, tolerance)
        expect(result[1][1]).toBeCloseTo(60, tolerance)
        expect(result[1][2]).toBeCloseTo(69, tolerance)
        expect(result[2][0]).toBeCloseTo(66, tolerance)
        expect(result[2][1]).toBeCloseTo(78, tolerance)
        expect(result[2][2]).toBeCloseTo(90, tolerance)
    })
})

//https://www.wolframalpha.com/input?i=vector+by+matrix+multiplication+calculator&assumption=%7B%22F%22%2C+%22MatricesOperations%22%2C+%22theMatrix2%22%7D+-%3E%22%7B%7B4.5%2C5%2C6.3%7D%2C%7B6%2C5%2C4.56%7D%2C%7B4%2C6%2C5%7D%7D%22&assumption=%7B%22F%22%2C+%22MatricesOperations%22%2C+%22theMatrix1%22%7D+-%3E%22%7B%7B1.123%2C2%2C3.26%7D%7D%22&assumption=%7B%22C%22%2C+%22matrix+multiplication%22%7D+-%3E+%7B%22Calculator%22%2C+%22dflt%22%7D
describe('Vector by matrix multiplication', () => {
    test('vec3 * m3x3', () => {
        const vec = new Vector(1.123, 2, 3.26)
        const m3x3 = new Matrix([
            [4.5, 5, 6.3],
            [6, 5, 4.56],
            [4, 6, 5],
        ])
        const result = vec.multiplyByMatrix(m3x3)
        expect(result[0]).toBeCloseTo(30.0935, tolerance)
        expect(result[1]).toBeCloseTo(35.175, tolerance)
        expect(result[2]).toBeCloseTo(32.4949, tolerance)
    })
})
