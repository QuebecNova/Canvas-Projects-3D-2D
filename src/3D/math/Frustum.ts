import { Matrix } from '@/common/Matrix'
import { Vector } from '@/common/Vector'
import { Chunks } from '../canvas/chunks'

export class Frustum {
    planes: Vector[]
    absPlanes: Vector[]
    mat: Matrix
    constructor(mat: Matrix) {
        mat = mat.transpose()
        this.mat = mat
        const top = new Vector()
        const bot = new Vector()
        const right = new Vector()
        const left = new Vector()
        const near = new Vector()
        const far = new Vector()
        for (let i = 0; i < 4; i++) right[i] = mat[i][3] - mat[i][0]
        for (let i = 0; i < 4; i++) left[i] = mat[i][3] + mat[i][0]
        for (let i = 0; i < 4; i++) top[i] = mat[i][3] - mat[i][1]
        for (let i = 0; i < 4; i++) bot[i] = mat[i][3] + mat[i][1]
        for (let i = 0; i < 4; i++) near[i] = mat[i][3] + mat[i][2]
        for (let i = 0; i < 4; i++) far[i] = mat[i][3] - mat[i][2]
        this.planes = [top, bot, right, left, near, far]
        this.absPlanes = this.planes.map((plane) => new Vector(...plane.map((v) => Math.abs(v))))
    }

    isChunkInside(x: number, z: number) {
        let isIntersects = true

        const max = [x + Chunks.width, Chunks.height, z + Chunks.width]
        const center = new Vector((x + max[0]) / 2, max[1] / 2, (z + max[2]) / 2, 1)
        const halfExtents = new Vector((max[0] - x) / 2, max[1] / 2, (max[2] - z) / 2)

        let i = 0
        for (const plane of this.planes) {
            const r = halfExtents.dot(this.absPlanes[i])
            const d = center.dot(plane)
            if (d < -r) {
                isIntersects = false
                break
            }
            i++
        }

        return isIntersects
    }
}
