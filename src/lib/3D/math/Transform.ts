import { Math } from '@/lib/common/Math'
import { Vector } from '@/lib/common/Vector'
import { Coords3D } from '@/types/Coords'
import { Mat4 } from './Mat4'

export class Transform {
    /**
     * @description Rotate 3D vector by x, y, z (axis) (degrees)
     * @returns Rotated 3D vector
     */
    static rotateVec3(vec: Vector, { x = 0, y = 0, z = 0 }: Partial<Coords3D>) {
        const xRad = Math.degToRad(x)
        const yRad = Math.degToRad(y)
        const zRad = Math.degToRad(z)
        return Mat4.Rotation.xyz(xRad, yRad, zRad).multiplyByVector(vec)
    }

    static translateVec3(
        vec: Vector,
        { x = 0, y = 0, z = 0 }: Partial<Coords3D>
    ) {
        return Mat4.Translation.xyz(x, y, z).multiplyByVector(vec)
    }

    static scaleVec3(vec: Vector, { x = 0, y = 0, z = 0 }: Partial<Coords3D>) {
        return Mat4.Scaling.xyz(x, y, z).multiplyByVector(vec)
    }
}
