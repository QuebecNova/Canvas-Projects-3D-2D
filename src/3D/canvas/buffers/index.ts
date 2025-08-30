import { Chunks } from '../chunks'

type InitialArguments = {
    gl: WebGL2RenderingContext
}

export class Buffers {
    private gl: WebGL2RenderingContext

    position: WebGLBuffer
    color: WebGLBuffer
    textureCoords: WebGLBuffer
    normals: WebGLBuffer
    modelMatrix: WebGLBuffer
    block: WebGLBuffer
    matrices: {
        buffer: WebGLBuffer
        array: Float32Array<ArrayBuffer>[]
        data: Float32Array<ArrayBuffer>
    }
    blocks: {
        buffer: WebGLBuffer
        array: Float32Array<ArrayBuffer>[]
        data: Float32Array<ArrayBuffer>
    }
    texture: WebGLTexture

    constructor({ gl }: InitialArguments) {
        this.gl = gl

        this.position = this.initPositionBuffer()
        this.color = this.initColorBuffer()
        this.textureCoords = this.initTextureCoordsBuffer()
        this.normals = this.initNormalsBuffer()
        this.modelMatrix = this.createStaticBuffer([])
        this.block = this.createStaticBuffer([])
        const { matrices, matrixBuffer, matrixData } = this.initMatricesBuffer()
        this.matrices = {
            array: matrices,
            buffer: matrixBuffer,
            data: matrixData,
        }
        const { blocks, blocksBuffer, blocksData } = this.initBlocksBuffer()
        this.blocks = {
            array: blocks,
            buffer: blocksBuffer,
            data: blocksData,
        }
        this.texture = this.loadTexture('./textures/blocks/atlas.png')
    }

    private initPositionBuffer() {
        //prettier-ignore
        const positions = [
            //top
            0,1,0,
            1,1,1,
            0,1,1,
            0,1,0,
            1,1,0,
            1,1,1,

            //bottom
            0,0,1,
            1,0,0,
            0,0,0,
            0,0,1,
            1,0,1,
            1,0,0,

            //right
            0,0,1,
            0,1,0,
            0,1,1,
            0,0,0,
            0,1,0,
            0,0,1,

            //front
            1,1,1,
            0,0,1,
            0,1,1,
            1,0,1,
            0,0,1,
            1,1,1,

            //left
            1,0,0,
            1,1,1,
            1,1,0,
            1,0,1,
            1,1,1,
            1,0,0,

            //back
            0,0,0,
            1,1,0,
            0,1,0,
            0,0,0,
            1,0,0,
            1,1,0,
        ]

        return this.createStaticBuffer(positions)
    }

    private initNormalsBuffer() {
        //prettier-ignore
        const normals = [
            // Top
            0,1,0,
            0,1,0,
            0,1,0,
            0,1,0,
            0,1,0,
            0,1,0,
            // Bottom
            0,-1,0,
            0,-1,0,
            0,-1,0,
            0,-1,0,
            0,-1,0,
            0,-1,0,
            // Left
            -1,0,0,
            -1,0,0,
            -1,0,0,
            -1,0,0,
            -1,0,0,
            -1,0,0,
            // Front
            0,0,1,
            0,0,1,
            0,0,1,
            0,0,1,
            0,0,1,
            0,0,1,

            // Right
            1,0,0,
            1,0,0,
            1,0,0,
            1,0,0,
            1,0,0,
            1,0,0,
            // Back
            0,0,-1,
            0,0,-1,
            0,0,-1,
            0,0,-1,
            0,0,-1,
            0,0,-1,
        ]

        return this.createStaticBuffer(normals)
    }

    //Not used
    private initColorBuffer() {
        // const faceColors = [
        //     [1.0, 1.0, 1.0, 1.0], // Front face: white
        //     [1.0, 0.0, 0.0, 1.0], // Back face: red
        //     [0.0, 1.0, 0.0, 1.0], // Top face: green
        //     [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
        //     [1.0, 0.0, 1.0, 1.0], // Left face: purple
        //     [1.0, 1.0, 0.0, 1.0], // Right face: yellow
        // ]

        // // Convert the array of colors into a table for all the vertices.

        // let colors: number[] = []

        // for (const c of faceColors) {
        //     // Repeat each color six times for the six vertices of the face
        //     colors = colors.concat(c, c, c, c, c, c)
        // }

        const colorBuffer = this.gl.createBuffer()
        // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer)
        // this.gl.bufferData(
        //     this.gl.ARRAY_BUFFER,
        //     new Float32Array(colors),
        //     this.gl.STATIC_DRAW
        // )

        return colorBuffer
    }

    private initTextureCoordsBuffer() {
        //prettier-ignore
        const textureCoords = [
            //top
            0, 1,
            1, 0,
            0, 0,
            0, 1,
            1, 1,
            1, 0,

            //bottom
            1, 1,
            0, 0,
            1, 0,
            1, 1,
            0, 1,
            0, 0,

            //left
            0, 1,
            1, 0,
            0, 0,
            1, 1,
            1, 0,
            0, 1,

            //back
            0, 0,
            1, 1,
            1, 0,
            0, 1,
            1, 1,
            0, 0,

            //right
            0, 1,
            1, 0,
            0, 0,
            1, 1,
            1, 0,
            0, 1,

            //front
            0, 1,
            1, 0,
            0, 0,
            0, 1,
            1, 1,
            1, 0,
        ]

        return this.createStaticBuffer(textureCoords)
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

    private initMatricesBuffer() {
        const arrLength = 16
        const totalBlocksCount = Chunks.getTotalBlocksCount()
        const matrixData = new Float32Array(totalBlocksCount * arrLength)
        const matrices = []
        for (let i = 0; i < totalBlocksCount; ++i) {
            const byteOffsetToMatrix = i * arrLength * 4
            const numFloatsForView = arrLength
            matrices.push(new Float32Array(matrixData.buffer, byteOffsetToMatrix, numFloatsForView))
        }
        const matrixBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, matrixBuffer)
        // just allocate the buffer
        this.gl.bufferData(this.gl.ARRAY_BUFFER, matrixData.byteLength, this.gl.DYNAMIC_DRAW)

        return { matrices, matrixData, matrixBuffer }
    }

    // 0: id (same as texture)
    // 1: reserved for future uses...
    private initBlocksBuffer() {
        const arrLength = 2
        const totalBlocksCount = Chunks.getTotalBlocksCount()
        const blocksData = new Float32Array(totalBlocksCount * arrLength)
        const blocks = []
        for (let i = 0; i < totalBlocksCount; ++i) {
            const byteOffsetToBlocks = i * arrLength * 4
            const numFloatsForView = arrLength
            blocks.push(new Float32Array(blocksData.buffer, byteOffsetToBlocks, numFloatsForView))
        }
        const blocksBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, blocksBuffer)
        // just allocate the buffer
        this.gl.bufferData(this.gl.ARRAY_BUFFER, blocksData.byteLength, this.gl.DYNAMIC_DRAW)

        return { blocks, blocksData, blocksBuffer }
    }

    private createStaticBuffer(arr: number[]) {
        const buffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(arr), this.gl.STATIC_DRAW)
        return buffer
    }
}
