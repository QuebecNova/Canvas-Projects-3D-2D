import { ErrorHandler } from '@/common/Error'
import { coordinatesToKey, keyToCoordinates } from '@/common/helpers/coordinates'
import { Block, BlockBits, Blocks } from '../../entities/Blocks'
import { Chunk } from '../../types/Chunk'
import { FlatCoords } from '../../types/FlatCoords'
import { ChunkBuffers, getBlockVertecies } from '../buffers/chunk'
import { Draw3D } from '../Draw'
import { Shaders } from '../shaders'
import { getChunkInfo, getMaxBlocksInChunk, isBlockInChunkRange } from './helpers'

type InitialArguments = {
    gl: WebGL2RenderingContext
    shaders: Shaders
}

const myWorker = new Worker(new URL('worker.ts', import.meta.url), {
    type: 'module',
})

export class Chunks {
    static width: number = 16
    static height: number = 128
    private readonly chunks: Chunk[] = []
    private readonly shaders: Shaders
    private readonly gl: WebGL2RenderingContext
    constructor({ gl, shaders }: InitialArguments) {
        this.gl = gl
        this.shaders = shaders
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
                return ErrorHandler.log(`This chunk is generated already: ${getChunkInfo(oldChunk)}`)
            }

            console.log(`Chunk is generated: ${getChunkInfo(generatedChunk)}`)

            this.setVBOs(generatedChunk)
            const chunksToUpdate: number[] = []
            updatedBlocks?.forEach((block) => {
                if (block.obscuredDirection !== BlockBits.IS_NOT_VISIBLE && block.id !== Blocks.air.id) {
                    if (!chunksToUpdate.includes(block.chunkIndex)) {
                        chunksToUpdate.push(block.chunkIndex)
                    }
                }
                this.setBlock(block)
            })
            chunksToUpdate.forEach((index) => {
                const chunk = this.chunks[index]
                this.setVBOs(chunk)
            })

            const newChunkIndex = chunkIndex + 1
            if (newChunkIndex < this.chunks.length) {
                this.requestChunk(this.chunks[newChunkIndex])
            }
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
        const adjacentChunks = this.getAdjacentChunks(chunk.x, chunk.z).map((c) => {
            const clone = { ...c, buffers: undefined }
            return clone
        })
        myWorker.postMessage({
            adjacentChunks: adjacentChunks,
            chunk: { ...chunk, buffers: undefined },
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

    draw() {
        this.chunks.forEach((chunk) => {
            if (chunk.buffers) {
                this.bindBuffer(chunk.buffers.vboBuffer)
                this.gl.drawArrays(this.gl.TRIANGLES, 0, 36 * chunk.buffers.offset)
                this.disableAttribs()
            }
        })
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

    private setVBOs(chunk: Chunk) {
        const vbo: number[] = []
        let offset = 0
        chunk.blocks.forEach((block) => {
            if (block.obscuredDirection !== BlockBits.IS_NOT_VISIBLE && block.id !== Blocks.air.id) {
                const vertecies = getBlockVertecies(block.x, block.y, block.z, block.id, block.obscuredDirection)
                vbo.push(...vertecies)
                if (!chunk.buffers) {
                    this.setBlock(block)
                }
                offset++
            }
        })
        chunk.buffers = new ChunkBuffers(this.gl, vbo, offset)
        vbo.length = 0
    }

    private bindBuffer(buffer: WebGLBuffer) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
        this.gl.vertexAttribPointer(this.shaders.attribLocations.vertexBlockPosition, 3, this.gl.FLOAT, false, 7 * 4, 0)
        this.gl.vertexAttribPointer(this.shaders.attribLocations.vertexBlockData, 2, this.gl.FLOAT, false, 7 * 4, 3 * 4)
        this.gl.vertexAttribPointer(this.shaders.attribLocations.vertexTexcoord, 2, this.gl.FLOAT, false, 7 * 4, 5 * 4)
        this.gl.enableVertexAttribArray(this.shaders.attribLocations.vertexBlockPosition)
        this.gl.enableVertexAttribArray(this.shaders.attribLocations.vertexBlockData)
        this.gl.enableVertexAttribArray(this.shaders.attribLocations.vertexTexcoord)
    }

    private disableAttribs() {
        this.gl.disableVertexAttribArray(this.shaders.attribLocations.vertexBlockPosition)
        this.gl.disableVertexAttribArray(this.shaders.attribLocations.vertexBlockData)
        this.gl.disableVertexAttribArray(this.shaders.attribLocations.vertexTexcoord)
    }
}
