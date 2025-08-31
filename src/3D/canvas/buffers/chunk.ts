import { BlockBits } from '@/3D/entities/Blocks'

const { FRONT, BACK, TOP, BOT, RIGHT, LEFT } = BlockBits

export class ChunkBuffers {
    private gl: WebGL2RenderingContext

    vboBuffer: WebGLBuffer
    offset: number

    constructor(gl: WebGL2RenderingContext, vbo: number[], offset: number) {
        this.gl = gl
        this.offset = offset
        this.vboBuffer = this.createStaticBuffer(vbo)
    }

    private createStaticBuffer(arr: number[]) {
        const buffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(arr), this.gl.STATIC_DRAW)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)
        return buffer
    }
}
//prettier-ignore
export const getBlockVertecies = (x:number,y:number,z:number, id: number, ob: number) => {
    const positions = []
    const top = 0
    const bot = 1
    const right = 2
    const front = 3
    const left = 4
    const back = 5
    if ((ob&TOP) === 0) {
        positions.push(
            x+0,y+1,z+0,
            id,top,0,1,
            x+1,y+1,z+1,
            id,top,1,0,
            x+0,y+1,z+1,
            id,top,0,0,
            x+0,y+1,z+0,
            id,top,0,1,
            x+1,y+1,z+0,
            id,top,1,1,
            x+1,y+1,z+1,
            id,top,1,0,
        )
    }
    if ((ob&BOT) === 0) {
        positions.push(
            x+0,y+0,z+1,
            id,bot,1,1,
            x+1,y+0,z+0,
            id,bot,0,0,
            x+0,y+0,z+0,
            id,bot,1,0,
            x+0,y+0,z+1,
            id,bot,1,1,
            x+1,y+0,z+1,
            id,bot,0,1,
            x+1,y+0,z+0,
            id,bot,0,0,
        )
    }
    if ((ob&RIGHT) === 0) {
        positions.push(
            x+1,y+0,z+0,
            id,right,0,1,
            x+1,y+1,z+1,
            id,right,1,0,
            x+1,y+1,z+0,
            id,right,0,0,
            x+1,y+0,z+1,
            id,right,1,1,
            x+1,y+1,z+1,
            id,right,1,0,
            x+1,y+0,z+0,
            id,right,0,1,
        )
    }
    if ((ob&FRONT) === 0) {
        positions.push(
            x+1,y+1,z+1,
            id,front,0,0,
            x+0,y+0,z+1,
            id,front,1,1,
            x+0,y+1,z+1,
            id,front,1,0,
            x+1,y+0,z+1,
            id,front,0,1,
            x+0,y+0,z+1,
            id,front,1,1,
            x+1,y+1,z+1,
            id,front,0,0,
        )
    }
    if ((ob&LEFT) === 0) {
        positions.push(
            x+0,y+0,z+1,
            id,left,0,1,
            x+0,y+1,z+0,
            id,left,1,0,
            x+0,y+1,z+1,
            id,left,0,0,
            x+0,y+0,z+0,
            id,left,1,1,
            x+0,y+1,z+0,
            id,left,1,0,
            x+0,y+0,z+1,
            id,left,0,1,
        )
    }
    if ((ob&BACK) === 0) {
        positions.push(
            x+0,y+0,z+0,
            id,back,0,1,
            x+1,y+1,z+0,
            id,back,1,0,
            x+0,y+1,z+0,
            id,back,0,0,
            x+0,y+0,z+0,
            id,back,0,1,
            x+1,y+0,z+0,
            id,back,1,1,
            x+1,y+1,z+0,
            id,back,1,0,
        )
    }
    return positions
}
