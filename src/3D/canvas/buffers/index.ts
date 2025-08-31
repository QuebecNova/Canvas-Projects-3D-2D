type InitialArguments = {
    gl: WebGL2RenderingContext
}

export class Buffers {
    private gl: WebGL2RenderingContext

    normals: number[][]
    modelMatrix: WebGLBuffer
    block: WebGLBuffer
    texture: WebGLTexture

    constructor({ gl }: InitialArguments) {
        this.gl = gl

        this.normals = this.initNormals()
        this.modelMatrix = this.createStaticBuffer([])
        this.block = this.createStaticBuffer([])
        this.texture = this.loadTexture('./textures/blocks/atlas.png')
    }

    private initNormals() {
        //prettier-ignore
        return [
            // Top
            [0,1,0],
            // Bottom
            [0,-1,0],
            // Right
            [1,0,0],
            // Front
            [0,0,1],
            // Left
            [-1,0,0],
            // Back
            [0,0,-1],
        ]
    }

    private loadTexture(url: string) {
        const texture = this.gl.createTexture()
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture)

        const level = 0
        const internalFormat = this.gl.RGBA
        const width = 512
        const height = 512
        const border = 0
        const srcFormat = this.gl.RGBA
        const srcType = this.gl.UNSIGNED_BYTE
        this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, null)

        const FRAMEBUFFER = {
            RENDERBUFFER: 0,
            COLORBUFFER: 1,
        }
        const fb = [this.gl.createFramebuffer(), this.gl.createFramebuffer()]
        const colorRenderbuffer = this.gl.createRenderbuffer()

        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, colorRenderbuffer)

        this.gl.renderbufferStorageMultisample(
            this.gl.RENDERBUFFER,
            this.gl.getParameter(this.gl.MAX_SAMPLES),
            this.gl.RGBA8,
            width,
            height
        )

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb[FRAMEBUFFER.RENDERBUFFER])

        this.gl.framebufferRenderbuffer(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0,
            this.gl.RENDERBUFFER,
            colorRenderbuffer
        )

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb[FRAMEBUFFER.COLORBUFFER])

        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, texture, 0)

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)

        const image = new Image()
        image.onload = () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
            this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image)

            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
        }
        image.src = url

        return texture
    }

    private createStaticBuffer(arr: number[]) {
        const buffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(arr), this.gl.STATIC_DRAW)
        return buffer
    }
}
