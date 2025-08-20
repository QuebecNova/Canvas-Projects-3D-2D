type InitialArguments = {
    gl: WebGLRenderingContext
}

export class Buffers {
    private gl: WebGLRenderingContext

    position: WebGLBuffer
    color: WebGLBuffer

    constructor({ gl }: InitialArguments) {
        this.gl = gl

        this.position = this.initPositionBuffer()
        this.color = this.initColorBuffer()
        this.initIndexBuffer()
    }

    private initPositionBuffer() {
        //prettier-ignore
        const positions = [
            //top
            0,1,0,
            0,1,1,
            1,1,1,
            0,1,0,
            1,1,1,
            1,1,0,

            //bottom
            0,0,1,
            0,0,0,
            1,0,0,
            0,0,1,
            1,0,0,
            1,0,1,

            //left
            0,0,1,
            0,1,1,
            0,1,0,
            0,0,0,
            0,0,1,
            0,1,0,

            //back
            1,1,1,
            0,1,1,
            0,0,1,
            1,0,1,
            1,1,1,
            0,0,1,

            //right
            1,0,0,
            1,1,0,
            1,1,1,
            1,0,1,
            1,0,0,
            1,1,1,

            // front
            0,0,0,
            0,1,0,
            1,1,0,
            0,0,0,
            1,1,0,
            1,0,0,
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

    private initColorBuffer() {
        const faceColors = [
            [1.0, 1.0, 1.0, 1.0], // Front face: white
            [1.0, 0.0, 0.0, 1.0], // Back face: red
            [0.0, 1.0, 0.0, 1.0], // Top face: green
            [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
            [1.0, 1.0, 0.0, 1.0], // Right face: yellow
            [1.0, 0.0, 1.0, 1.0], // Left face: purple
        ]

        // Convert the array of colors into a table for all the vertices.

        let colors: number[] = []

        for (const c of faceColors) {
            // Repeat each color four times for the four vertices of the face
            colors = colors.concat(c, c, c, c)
        }

        const colorBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer)
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(colors),
            this.gl.STATIC_DRAW
        )

        return colorBuffer
    }

    private initIndexBuffer() {
        const indexBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.

        // prettier-ignore
        const indices = [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23,   // left
        ];

        // Now send the element array to GL

        this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices),
            this.gl.STATIC_DRAW
        )

        return indexBuffer
    }
}
