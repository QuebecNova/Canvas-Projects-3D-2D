import { Chunks } from '../Chunks'

type InitialArguments = {
    gl: WebGLRenderingContext
}

export class Buffers {
    private gl: WebGLRenderingContext

    position: WebGLBuffer
    color: WebGLBuffer
    textureCoords: WebGLBuffer
    matrices: {
        buffer: WebGLBuffer
        array: Float32Array<ArrayBuffer>[]
        data: Float32Array<ArrayBuffer>
        instances: { x: number; y: number; z: number; count: number }
    }
    texture: WebGLTexture

    constructor({ gl }: InitialArguments) {
        this.gl = gl

        this.position = this.initPositionBuffer()
        this.color = this.initColorBuffer()
        this.textureCoords = this.initTextureCoordsBuffer()
        const { matrices, matrixBuffer, matrixData, instances } =
            this.initMatricesBuffer()
        this.matrices = {
            array: matrices,
            buffer: matrixBuffer,
            data: matrixData,
            instances: {
                ...instances,
                count: Buffers.getInstancesCount(instances),
            },
        }
        this.texture = this.loadTexture('/lib/3D/textures/block/atlas.png')
    }

    private initPositionBuffer() {
        const top = 1.00001
        const bot = -0.00001
        //prettier-ignore
        const positions = [
            //top
            0,top,0,
            1,top,1,
            0,top,1,
            0,top,0,
            1,top,0,
            1,top,1,

            //bottom
            0,bot,1,
            1,bot,0,
            0,bot,0,
            0,bot,1,
            1,bot,1,
            1,bot,0,

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

        const positionBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(positions),
            this.gl.STATIC_DRAW
        )

        return positionBuffer
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

        // Convert the array of colors into a table for all the vertices.

        const textureBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureBuffer)
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(textureCoords),
            this.gl.STATIC_DRAW
        )

        return textureBuffer
    }

    private loadTexture(url: string) {
        const texture = this.gl.createTexture()
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture)

        const level = 0
        const internalFormat = this.gl.RGBA
        const width = 1
        const height = 1
        const border = 0
        const srcFormat = this.gl.RGBA
        const srcType = this.gl.UNSIGNED_BYTE
        const pixel = new Uint8Array([0, 0, 0, 1.0])
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            level,
            internalFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixel
        )

        const image = new Image()
        image.onload = () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                level,
                internalFormat,
                srcFormat,
                srcType,
                image
            )

            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_WRAP_S,
                this.gl.CLAMP_TO_EDGE
            )
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_WRAP_T,
                this.gl.CLAMP_TO_EDGE
            )
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_MIN_FILTER,
                this.gl.LINEAR
            )
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_MAG_FILTER,
                this.gl.NEAREST
            )
        }
        image.src = url

        return texture
    }

    private initMatricesBuffer() {
        const instances = { x: Chunks.size, y: Chunks.height, z: Chunks.size }
        const matrixData = new Float32Array(
            Buffers.getInstancesCount(instances) * 16
        )
        const matrices = []
        for (let i = 0; i < Buffers.getInstancesCount(instances); ++i) {
            const byteOffsetToMatrix = i * 16 * 4
            const numFloatsForView = 16
            matrices.push(
                new Float32Array(
                    matrixData.buffer,
                    byteOffsetToMatrix,
                    numFloatsForView
                )
            )
        }
        const matrixBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, matrixBuffer)
        // just allocate the buffer
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            matrixData.byteLength,
            this.gl.DYNAMIC_DRAW
        )

        return { matrices, matrixData, matrixBuffer, instances }
    }

    static getInstancesCount({ x, y, z }: { x: number; y: number; z: number }) {
        const chunks = Chunks.getMaxChunksCount()
        return x * y * z * chunks
    }
}
