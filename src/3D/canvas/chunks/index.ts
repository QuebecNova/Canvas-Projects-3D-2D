import { ErrorHandler } from '@/common/Error'
import { coordinatesToKey, keyToCoordinates } from '@/common/helpers/coordinates'
import { Block, Blocks } from '../../entities/Blocks'
import { Mat4 } from '../../math/Mat4'
import { Chunk } from '../../types/Chunk'
import { FlatCoords } from '../../types/FlatCoords'
import { Buffers } from '../buffers'
import { Draw3D } from '../Draw'
import { Shaders } from '../shaders'
import { getChunkInfo, getMaxBlocksInChunk, isBlockInChunkRange } from './helpers'

type InitialArguments = {
    gl: WebGL2RenderingContext
    buffers: Buffers
    shaders: Shaders
    Draw3D: Draw3D
}

const myWorker = new Worker(new URL('worker.ts', import.meta.url), {
    type: 'module',
})

export class Chunks {
    static width: number = 16
    static height: number = 64
    private readonly chunks: Chunk[] = []
    private readonly buffers: Buffers
    private readonly shaders: Shaders
    private readonly blocksToDraw: Blocks = new Map()
    private readonly gl: WebGL2RenderingContext
    private readonly Draw3D: Draw3D
    constructor({ gl, buffers, shaders, Draw3D }: InitialArguments) {
        this.gl = gl
        this.Draw3D = Draw3D
        this.shaders = shaders
        this.buffers = buffers
        this.createEmptyChunks()
        if (!this.chunks.length || !window.Worker) return

        this.sendChunkSize()

        myWorker.onmessage = this.onWorkerResponse.bind(this)
    }

    private createEmptyChunks() {
        if (this.chunks.length > Chunks.getMaxChunksCount()) return
        for (let i = 0; i < Chunks.getMaxChunksCount(); i++) {
            const { x, z } = this.findNextChunkCoords()
            if (this.chunks.find((chunk) => chunk.x === x && chunk.z === z)) {
                return ErrorHandler.log(`Same chunk was created x:${x}, z:${z}`)
            }
            this.chunks.push({ x, z, blocks: new Map(), index: i })
        }
    }

    onWorkerResponse(e: {
        data: {
            generatedChunk?: Chunk
            updatedBlocks?: Blocks
            message?: string
            error?: string
            chunkSize?: boolean
        }
    }) {
        const { message, error, generatedChunk, updatedBlocks, chunkSize } = e.data
        if (error) {
            return ErrorHandler.log(error)
        }
        if (chunkSize) {
            const firstChunk = this.chunks[0]
            this.requestChunk(firstChunk)
        }
        if (generatedChunk) {
            const chunkIndex = this.chunks.findIndex((c) => c.index === generatedChunk.index)
            if (chunkIndex === -1) {
                return ErrorHandler.log(`This chunk doesn't exist: index:${chunkIndex}`)
            }
            const oldChunk = this.chunks[chunkIndex]
            if (oldChunk.blocks.size > 0) {
                return ErrorHandler.log(`This chunk generated already: ${getChunkInfo(oldChunk)}`)
            }

            console.log(`Chunk is generated: ${getChunkInfo(generatedChunk)}`)

            generatedChunk.blocks.forEach((block) => {
                this.setBlock(block)
                this.updateBlockInfo(block)
                this.updateBlockPosition(block)
                // if (block.obscuredDirection !== BlockBits.IS_NOT_VISIBLE && block.id !== Blocks.air.id) {
                //     this.blocksToDraw.set(key, block)
                // }
            })
            updatedBlocks?.forEach((block) => {
                this.setBlock(block)
                this.updateBlockInfo(block)
                // if (block.obscuredDirection !== BlockBits.IS_NOT_VISIBLE && block.id !== Blocks.air.id) {
                //     this.blocksToDraw.set(key, block)
                // }
            })
            // console.log('updated blocks', updatedBlocks)
            const newChunkIndex = chunkIndex + 1
            if (newChunkIndex < this.chunks.length) {
                this.requestChunk(this.chunks[newChunkIndex])
            }

            this.bindBuffers()
        } else if (!message && !error) {
            console.error(generatedChunk, updatedBlocks, chunkSize)
            return ErrorHandler.log(`Chunk is not generated`)
        }
        if (message) {
            return console.log(message)
        }
    }

    sendChunkSize() {
        myWorker.postMessage({
            width: Chunks.width,
            height: Chunks.height,
        })
    }

    requestChunk(chunk: Chunk) {
        const adjacentChunks = this.getAdjacentChunks(chunk.x, chunk.z)
        myWorker.postMessage({
            adjacentChunks: adjacentChunks,
            chunk,
        })
    }

    //Gets a new chunk coords (drawing square from (0,0) clockwise)
    findNextChunkCoords(): FlatCoords {
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
            z = Chunks.width
            return { x, z }
        }
        const zd = lastChunk.z / Chunks.width
        const xd = lastChunk.x / Chunks.width
        x = lastChunk.x
        z = lastChunk.z
        if (zd > 0 && xd > 0) {
            if (zd === layer) {
                x = lastChunk.x - Chunks.width
            } else if (xd === layer) {
                z = lastChunk.z + Chunks.width
            } else {
                z = lastChunk.z + Chunks.width
            }
        }
        if (zd > 0 && xd < 0) {
            if (xd === -layer) {
                z = lastChunk.z - Chunks.width
            } else if (zd === layer) {
                x = lastChunk.x - Chunks.width
            }
        }
        if (zd < 0 && xd < 0) {
            if (zd === -layer) {
                x = lastChunk.x + Chunks.width
            } else if (xd === -layer) {
                z = lastChunk.z - Chunks.width
            }
        }
        if (zd < 0 && xd > 0) {
            if (xd === layer) {
                z = lastChunk.z + Chunks.width
            } else if (zd === -layer) {
                x = lastChunk.x + Chunks.width
            }
        }
        if (zd === 0 && xd > 0) {
            z = lastChunk.z + Chunks.width
        }
        if (zd === 0 && xd < 0) {
            z = lastChunk.z - Chunks.width
        }
        if (zd > 0 && xd === 0) {
            x = lastChunk.x - Chunks.width
        }
        if (zd < 0 && xd === 0) {
            x = lastChunk.x + Chunks.width
        }
        return { x, z }
    }

    getLayer() {
        const n = Math.ceil(Math.sqrt(this.chunks.length + 1))
        const layer = (n % 2 ? n - 1 : n) / 2
        return layer
    }

    updateBlockInfo(block: Block) {
        // this.buffers.block
        this.buffers.blocks.array[block.instanceId].set(new Float32Array([block.id, block.obscuredDirection]))
    }

    updateBlockPosition(block: Block) {
        this.buffers.matrices.array[block.instanceId].set(
            new Float32Array(Mat4.TranslationFlipped.xyz(block.x, block.y, block.z))
        )
    }

    draw() {
        // console.log(this.blocksToDraw)
        // this.blocksToDraw.forEach((block) => {
        //     const blockBuffers = new BlockBuffers(this.gl, Mat4.TranslationFlipped.xyz(block.x, block.y, block.z), [
        //         block.id,
        //         block.obscuredDirection,
        //     ])
        //     // // set all 4 attributes for matrix
        //     // const bytesPerMatrix = 4 * 16
        //     // for (let i = 0; i < 4; ++i) {
        //     //     const loc = this.shaders.attribLocations.vertexModelMatrix + i
        //     //     this.gl.enableVertexAttribArray(loc)
        //     //     // note the stride and offset
        //     //     const offset = i * 16 // 4 floats per row, 4 bytes per float
        //     //     this.gl.vertexAttribPointer(
        //     //         loc, // location
        //     //         4, // size (num values to pull from buffer per iteration)
        //     //         this.gl.FLOAT, // type of data in buffer
        //     //         false, // normalize
        //     //         bytesPerMatrix, // stride, num bytes to advance to get to next set of values
        //     //         offset // offset in buffer
        //     //     )
        //     // }
        //     this.Draw3D.enableAttrib(2, blockBuffers.info, this.shaders.attribLocations.vertexBlock)
        //     this.Draw3D.enableAttrib(16, blockBuffers.modelMatrix, this.shaders.attribLocations.vertexModelMatrix)
        //     this.gl.drawArrays(this.gl.TRIANGLES, 0, this.blocksToDraw.size)
        // })
        this.gl.drawArraysInstanced(
            this.gl.TRIANGLES,
            0, // offset
            36, // num vertices per instance
            this.buffers.matrices.array.length // num instances
        )
    }

    getCoordsFromKey(key: BigInt) {
        return keyToCoordinates(key)
    }

    getKeyFromCoords(x: number, y: number, z: number) {
        return coordinatesToKey(x, y, z)
    }

    setBlock(block: Block) {
        this.chunks[block.chunkIndex].blocks.set(this.getKeyFromCoords(block.x, block.y, block.z), block)
        return true
    }

    getBlock(x: number, y: number, z: number) {
        if (y < 0) return undefined
        const chunk = this.chunks.find((chunk) => isBlockInChunkRange(chunk.x, chunk.z, x, z, Chunks.width))
        if (!chunk) return undefined
        return chunk.blocks.get(this.getKeyFromCoords(x, y, z))
    }

    private getAdjacentChunks(x: number, z: number) {
        const highX = x + Chunks.width
        const highZ = z + Chunks.width
        const lowX = x - Chunks.width
        const lowZ = z - Chunks.width
        return this.chunks.filter((chunk) => {
            return (
                (chunk.x === highX && chunk.z === highZ) ||
                (chunk.x === highX && chunk.z === lowZ) ||
                (chunk.x === lowX && chunk.z === highZ) ||
                (chunk.x === lowX && chunk.z === lowZ) ||
                (chunk.x === x && chunk.z === highZ) ||
                (chunk.x === x && chunk.z === lowZ) ||
                (chunk.z === z && chunk.x === highX) ||
                (chunk.z === z && chunk.x === lowX)
            )
        })
    }

    static getMaxChunksCount() {
        const count = (Draw3D.renderDistance + 1) * 2 - 1

        return count * count
    }

    static getTotalBlocksCount() {
        const chunks = Chunks.getMaxChunksCount()
        return getMaxBlocksInChunk(Chunks.width, Chunks.height) * chunks
    }

    private bindBuffers() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.blocks.buffer)
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.buffers.blocks.data)
        const blocksLoc = this.shaders.attribLocations.vertexBufferBlocks
        this.gl.enableVertexAttribArray(blocksLoc)
        this.gl.vertexAttribPointer(
            blocksLoc, // location
            2, // size (num values to pull from buffer per iteration)
            this.gl.FLOAT, // type of data in buffer
            false, // normalize
            0, // stride, num bytes to advance to get to next set of values
            0 // offset in buffer
        )
        // this line says this attribute only changes for each 1 instance
        this.gl.vertexAttribDivisor(blocksLoc, 1)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.matrices.buffer)
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.buffers.matrices.data)
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
            this.gl.vertexAttribDivisor(loc, 1)
        }
    }
}
