import { Mat4 } from '../math/Mat4'
import { Buffers } from './buffers'
import { Draw3D } from './Draw'
import { Shaders } from './shaders'

type InitialArguments = {
    gl: WebGLRenderingContext
    buffers: Buffers
    shaders: Shaders
    ext: ANGLE_instanced_arrays
}

export class Chunks {
    static size: number = 16
    static height: number = 4
    chunks: { x: number; z: number }[] = []
    private gl: WebGLRenderingContext
    private buffers: Buffers
    private shaders: Shaders
    private ext: ANGLE_instanced_arrays
    constructor({ gl, buffers, shaders, ext }: InitialArguments) {
        this.gl = gl
        this.buffers = buffers
        this.shaders = shaders
        this.ext = ext
    }

    //Gets a new chunk coords (drawing square from (0,0) clockwise)
    private findNextChunkCoords(): { x: number; z: number } {
        let x = 0
        let z = 0
        const lastChunk = this.chunks.at(-1)
        const layer = this.getLayer()
        if (lastChunk === undefined) {
            x = 0
            z = 0
            return { x, z }
        }
        if (lastChunk.x === 0 && lastChunk.z === 0) {
            x = 0
            z = Chunks.size
            return { x, z }
        }
        const zd = lastChunk.z / Chunks.size
        const xd = lastChunk.x / Chunks.size
        x = lastChunk.x
        z = lastChunk.z
        if (zd > 0 && xd > 0) {
            if (zd === layer) {
                x = lastChunk.x - Chunks.size
            } else if (xd === layer) {
                z = lastChunk.z + Chunks.size
            } else {
                z = lastChunk.z + Chunks.size
            }
        }
        if (zd > 0 && xd < 0) {
            if (xd === -layer) {
                z = lastChunk.z - Chunks.size
            } else if (zd === layer) {
                x = lastChunk.x - Chunks.size
            }
        }
        if (zd < 0 && xd < 0) {
            if (zd === -layer) {
                x = lastChunk.x + Chunks.size
            } else if (xd === -layer) {
                z = lastChunk.z - Chunks.size
            }
        }
        if (zd < 0 && xd > 0) {
            if (xd === layer) {
                z = lastChunk.z + Chunks.size
            } else if (zd === -layer) {
                x = lastChunk.x + Chunks.size
            }
        }
        if (zd === 0 && xd > 0) {
            z = lastChunk.z + Chunks.size
        }
        if (zd === 0 && xd < 0) {
            z = lastChunk.z - Chunks.size
        }
        if (zd > 0 && xd === 0) {
            x = lastChunk.x - Chunks.size
        }
        if (zd < 0 && xd === 0) {
            x = lastChunk.x + Chunks.size
        }
        return { x, z }
    }

    private getLayer() {
        const n = Math.ceil(Math.sqrt(this.chunks.length + 1))
        const layer = (n % 2 ? n - 1 : n) / 2
        return layer
    }

    generate() {
        const coords = this.findNextChunkCoords()
        this.chunks.push(coords)
    }

    draw() {
        const { x: xL, y: yL, z: zL } = this.buffers.matrices.instances
        let i = 0
        const adjustToCenter = Chunks.size / 2
        this.chunks.forEach((coords) => {
            for (let x = coords.x; x < xL + coords.x; x++) {
                for (let y = 0; y < yL; y++) {
                    for (let z = coords.z; z < zL + coords.z; z++) {
                        this.buffers.matrices.array[i].set(
                            new Float32Array(
                                Mat4.TranslationFlipped.xyz(
                                    x - adjustToCenter,
                                    y,
                                    z - adjustToCenter
                                ).toArray()
                            )
                        )
                        i++
                    }
                }
            }
        })
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.matrices.buffer)
        this.gl.bufferSubData(
            this.gl.ARRAY_BUFFER,
            0,
            this.buffers.matrices.data
        )

        // set all 4 attributes for matrix
        const bytesPerMatrix = 4 * 16
        for (let i = 0; i < 4; ++i) {
            const loc = this.shaders.attribLocations.vertexBufferMatrix + i
            this.gl.enableVertexAttribArray(loc)
            // note the stride and offset
            const offset = i * 16 // 4 floats per row, 4 bytes per float
            this.gl.vertexAttribPointer(
                loc, // location
                4, // size (num values to pull from buffer per iteration)
                this.gl.FLOAT, // type of data in buffer
                false, // normalize
                bytesPerMatrix, // stride, num bytes to advance to get to next set of values
                offset // offset in buffer
            )
            // this line says this attribute only changes for each 1 instance
            this.ext.vertexAttribDivisorANGLE(loc, 1)
        }
        this.ext.drawArraysInstancedANGLE(
            this.gl.TRIANGLES,
            0, // offset
            36, // num vertices per instance
            this.buffers.matrices.instances.count // num instances
        )
    }

    static getMaxChunksCount() {
        const count = (Draw3D.renderDistance + 1) * 2 - 1

        return count * count
    }
}
