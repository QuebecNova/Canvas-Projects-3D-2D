import { Vector } from '@/common/Vector'
import { Mat4 } from '../Mat4'
import { Transform } from '../Transform'

describe('3D Vector Rotation', () => {
    const v = new Vector(1, 1, 1, 1)
    const tolerance = 1e-10 // For floating point precision

    describe('X-axis rotation for vec [0,1,0,1] using only plain rotation matrix', () => {
        test('180° rotation', () => {
            const vec = new Vector(0, 1, 0, 1)
            const matrix = Mat4.Rotation.x(Math.PI)
            const result = vec.multiplyByMatrix(matrix)
            expect(result[0]).toBeCloseTo(0, tolerance)
            expect(result[1]).toBeCloseTo(-1, tolerance)
            expect(result[2]).toBeCloseTo(0, tolerance)
        })
    })

    describe('Y-axis rotation for vec [1,0,0,1] using only plain rotation matrix', () => {
        test('180° rotation', () => {
            const vec = new Vector(1, 0, 0, 1)
            const matrix = Mat4.Rotation.y(Math.PI)
            const result = vec.multiplyByMatrix(matrix)
            expect(result[0]).toBeCloseTo(-1, tolerance)
            expect(result[1]).toBeCloseTo(0, tolerance)
            expect(result[2]).toBeCloseTo(0, tolerance)
        })
    })

    describe('Z-axis rotation for vec [1,0,0,1] using only plain rotation matrix', () => {
        test('180° rotation', () => {
            const vec = new Vector(1, 0, 0, 1)
            const matrix = Mat4.Rotation.z(Math.PI)
            const result = vec.multiplyByMatrix(matrix)
            expect(result[0]).toBeCloseTo(-1, tolerance)
            expect(result[1]).toBeCloseTo(0, tolerance)
            expect(result[2]).toBeCloseTo(0, tolerance)
        })
    })

    describe('X-axis rotation for vec [0,1,0,1]', () => {
        test('180° rotation', () => {
            const vec = new Vector(0, 1, 0, 1)
            const result = Transform.rotateVec3(vec, { x: 180 })
            expect(result[0]).toBeCloseTo(0, tolerance)
            expect(result[1]).toBeCloseTo(-1, tolerance)
            expect(result[2]).toBeCloseTo(0, tolerance)
        })
    })

    describe('X-axis rotation', () => {
        test('90° rotation', () => {
            const result = Transform.rotateVec3(v, { x: 90 })
            expect(result[0]).toBeCloseTo(1, tolerance)
            expect(result[1]).toBeCloseTo(1, tolerance)
            expect(result[2]).toBeCloseTo(-1, tolerance)
        })

        test('180° rotation', () => {
            const result = Transform.rotateVec3(v, { x: 180 })
            expect(result[0]).toBeCloseTo(1, tolerance)
            expect(result[1]).toBeCloseTo(-1, tolerance)
            expect(result[2]).toBeCloseTo(-1, tolerance)
        })

        test('270° rotation', () => {
            const result = Transform.rotateVec3(v, { x: 270 })
            expect(result[0]).toBeCloseTo(1, tolerance)
            expect(result[1]).toBeCloseTo(-1, tolerance)
            expect(result[2]).toBeCloseTo(1, tolerance)
        })
    })

    describe('Y-axis rotation', () => {
        test('90° rotation', () => {
            const result = Transform.rotateVec3(v, { y: 90 })
            expect(result[0]).toBeCloseTo(-1, tolerance)
            expect(result[1]).toBeCloseTo(1, tolerance)
            expect(result[2]).toBeCloseTo(1, tolerance)
        })

        test('180° rotation', () => {
            const result = Transform.rotateVec3(v, { y: 180 })
            expect(result[0]).toBeCloseTo(-1, tolerance)
            expect(result[1]).toBeCloseTo(1, tolerance)
            expect(result[2]).toBeCloseTo(-1, tolerance)
        })

        test('270° rotation', () => {
            const result = Transform.rotateVec3(v, { y: 270 })
            expect(result[0]).toBeCloseTo(1, tolerance)
            expect(result[1]).toBeCloseTo(1, tolerance)
            expect(result[2]).toBeCloseTo(-1, tolerance)
        })
    })

    describe('Z-axis rotation', () => {
        test('90° rotation', () => {
            const result = Transform.rotateVec3(v, { z: 90 })
            expect(result[0]).toBeCloseTo(1, tolerance)
            expect(result[1]).toBeCloseTo(-1, tolerance)
            expect(result[2]).toBeCloseTo(1, tolerance)
        })

        test('180° rotation', () => {
            const result = Transform.rotateVec3(v, { z: 180 })
            expect(result[0]).toBeCloseTo(-1, tolerance)
            expect(result[1]).toBeCloseTo(-1, tolerance)
            expect(result[2]).toBeCloseTo(1, tolerance)
        })

        test('270° rotation', () => {
            const result = Transform.rotateVec3(v, { z: 270 })
            expect(result[0]).toBeCloseTo(-1, tolerance)
            expect(result[1]).toBeCloseTo(1, tolerance)
            expect(result[2]).toBeCloseTo(1, tolerance)
        })
    })

    describe('Multiple consecutive rotations', () => {
        test('0° rotation', () => {
            const result = Transform.rotateVec3(v, { x: 0, y: 0, z: 0 })
            expect(result).toEqual([1, 1, 1, 1])
        })

        test('45° rotation', () => {
            const result = Transform.rotateVec3(v, { x: 45, y: 45, z: 45 })
            expect(result[0]).toBeCloseTo(0.2929, tolerance)
            expect(result[1]).toBeCloseTo(1.2071, tolerance)
            expect(result[2]).toBeCloseTo(1.2071, tolerance)
        })
    })
})
