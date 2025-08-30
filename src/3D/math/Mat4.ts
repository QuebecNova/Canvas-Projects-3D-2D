import { Matrix } from '@/common/Matrix'
import { cos, evaluate, sin } from 'mathjs'

export class Mat4 {
    static Translation = {
        xyz: (tx: number, ty: number, tz: number) =>
            new Matrix([
                [1, 0, 0, tx],
                [0, 1, 0, ty],
                [0, 0, 1, tz],
                [0, 0, 0, 1],
            ]),
    }
    // To send to webgl
    static TranslationFlipped = {
        xyz: (tx: number, ty: number, tz: number) =>
            [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                tx, ty, tz, 1,
            ]
    }
    static Scaling = {
        xyz: (sx: number, sy: number, sz: number) =>
            new Matrix([
                [sx, 0, 0, 0],
                [0, sy, 0, 0],
                [0, 0, sz, 0],
                [0, 0, 0, 1],
            ]),
    }
    //Clocwise rotation matrix around 0,0,0 axis
    static Rotation = {
        x: (θ: number) =>
            new Matrix([
                [1, 0, 0, 0],
                [0, cos(θ), -sin(θ), 0],
                [0, sin(θ), cos(θ), 0],
                [0, 0, 0, 1],
            ]),
        y: (θ: number) =>
            new Matrix([
                [cos(θ), 0, sin(θ), 0],
                [0, 1, 0, 0],
                [-sin(θ), 0, cos(θ), 0],
                [0, 0, 0, 1],
            ]),
        z: (θ: number) =>
            new Matrix([
                [cos(θ), -sin(θ), 0, 0],
                [sin(θ), cos(θ), 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1],
            ]),
        xyz: (α: number, β: number, γ: number) =>
            Mat4.Rotation.z(γ)
                .multiply(Mat4.Rotation.y(β))
                .multiply(Mat4.Rotation.x(α)),
    }
    static Projection = (
        aspectRatio: number,
        fov: number,
        zFar: number,
        zNear: number
    ): Matrix => {
        const f = evaluate(`1/tan(${fov}/2)`)
        const x = evaluate(`${aspectRatio}*${f}`)
        const y = f
        const q = -evaluate(`${zFar}/(${zFar}-${zNear})`)
        const z2 = -evaluate(`${zNear}*${q}`)
        const zClipFactor = 0.001
        return new Matrix([
            [x, 0, 0, 0],
            [0, y, 0, 0],
            [0, 0, q, zClipFactor],
            [0, 0, z2, 0],
        ])
        // return new Matrix([
        //     [f, 0, 0, 0],
        //     [0, y, 0, 0],
        //     [0, 0, q, zClipFactor],
        //     [0, 0, 0, 1],
        // ])
        //     var f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        // var rangeInv = 1.0 / (zNear - zFar);
        //     return new Matrix([
        //   [f / aspectRatio, 0, 0, 0],
        //   [0, f, 0, 0],
        //   [0, 0, (zNear + zFar) * rangeInv, -1],
        //   [0, 0, zNear * zFar * rangeInv * 2, 0]
        // ])
    }
}
