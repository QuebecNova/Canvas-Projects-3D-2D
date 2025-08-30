export class BlockBuffers {
    private gl: WebGL2RenderingContext

    modelMatrix: WebGLBuffer
    info: WebGLBuffer

    constructor (gl:WebGL2RenderingContext, modelMatrix:number[], info:number[]) {
        this.gl = gl
        this.modelMatrix = this.createStaticBuffer(modelMatrix)
        this.info = this.createStaticBuffer(info)
    }

    private createStaticBuffer(arr: number[]) {
        const buffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(arr), this.gl.STATIC_DRAW)
        return buffer
    }
}
