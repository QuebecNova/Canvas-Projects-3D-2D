import { coordinatesToKey, keyToCoordinates } from '@/common/helpers/coordinates'
import { Block, BlockBits, Blocks, BlockTypes } from '../../entities/Blocks'
import { Chunk } from '../../types/Chunk'
import { Bioms } from '../Bioms'
import { getChunkInfo, isBlockInChunkRange, isBlockOnChunkBorder } from './helpers'

const { FRONT, BACK, TOP, BOT, RIGHT, LEFT, IS_NOT_VISIBLE } = BlockBits

class Gen {
    static width = 0
    static height = 0
    static bioms: Bioms
    static adjacentChunks: Chunk[] = []
    static chunks: Chunk[] = []
    constructor() {
        this.startListening()
    }

    private startListening() {
        onmessage = (e) => {
            let { adjacentChunks, width, height, chunk } = e.data as {
                adjacentChunks?: Chunk[]
                width?: number
                height?: number
                chunk?: Chunk
            }
            if (height && width) {
                if (width && Gen.width !== width) {
                    Gen.width = width
                }
                if (height && Gen.height !== height) {
                    Gen.height = height
                    Gen.bioms = new Bioms(height)
                }
                postMessage({ message: `Worker chunk size has been set: w:${width}, h:${height}`, chunkSize: true })
            }
            if (adjacentChunks && chunk) {
                postMessage({ message: `Generating chunk: ${getChunkInfo(chunk)}` })

                Gen.adjacentChunks = adjacentChunks

                let [generatedChunk, updatedBlocks] = this.run(chunk)

                if (chunk.blocks.size) {
                    postMessage({ generatedChunk, updatedBlocks })
                } else {
                    postMessage({
                        error: `Chunk is not generated: ${getChunkInfo(chunk)}`,
                    })
                }
                chunk = undefined
                adjacentChunks = undefined
                Gen.adjacentChunks = []
            } else {
                postMessage({ message: 'Worker recieved a message' })
            }
        }
    }

    private run(chunk: Chunk): [Chunk, Blocks] {
        const updatedBlocks: Blocks = new Map()
        Gen.chunks = Gen.adjacentChunks.concat(chunk)
        for (let x = chunk.x; x < Gen.width + chunk.x; x++) {
            for (let y = 0; y < Gen.height; y++) {
                for (let z = chunk.z; z < Gen.width + chunk.z; z++) {
                    this.setBlock({
                        x,
                        y,
                        z,
                        obscuredDirection: 0,
                        ...this.computeBlock(x, y, z, Gen.height),
                        chunkIndex: chunk.index,
                    })
                }
            }
        }
        chunk.blocks.forEach((block) => {
            let { x, y, z, type } = block
            if (block.type === BlockTypes.AIR) return
            //Creating an array here is a big perfomance loss
            const front = this.getBlock(x, y, z + 1)
            const back = this.getBlock(x, y, z - 1)
            const top = this.getBlock(x, y + 1, z)
            const bot = this.getBlock(x, y - 1, z)
            const right = this.getBlock(x + 1, y, z)
            const left = this.getBlock(x - 1, y, z)

            if (isBlockOnChunkBorder(chunk.x, chunk.z, x, z, Gen.width) && chunk.index !== 0) {
                this.updateNearbyBlocks(chunk.index, front, back, top, bot, right, left).forEach((b) => {
                    updatedBlocks.set(this.getKeyFromCoords(b.x, b.y, b.z), b)
                })
            }

            let obscuredDirection = 0
            if (front && front.type !== BlockTypes.AIR) obscuredDirection |= FRONT
            if (back && back.type !== BlockTypes.AIR) obscuredDirection |= BACK
            if (top && top.type !== BlockTypes.AIR) obscuredDirection |= TOP
            if (bot && bot.type !== BlockTypes.AIR) obscuredDirection |= BOT
            if (left && left.type !== BlockTypes.AIR) obscuredDirection |= LEFT
            if (right && right.type !== BlockTypes.AIR) obscuredDirection |= RIGHT
            if (type === BlockTypes.DIRT && !(obscuredDirection & TOP)) {
                block.id = Blocks[BlockTypes.GRASS].id
                block.type = BlockTypes.GRASS
            }
            if (obscuredDirection === block.obscuredDirection && obscuredDirection === IS_NOT_VISIBLE) return
            block.obscuredDirection = obscuredDirection
        })
        return [chunk, updatedBlocks]
    }

    updateNearbyBlocks(
        chunkIndex: number,
        front?: Block,
        back?: Block,
        top?: Block,
        bot?: Block,
        right?: Block,
        left?: Block
    ) {
        const blocksToUpdate: Block[] = []
        if (front && front.chunkIndex !== chunkIndex && front.obscuredDirection !== IS_NOT_VISIBLE) {
            front.obscuredDirection |= BACK
            blocksToUpdate.push(front)
        }
        if (back && back.chunkIndex !== chunkIndex && back.obscuredDirection !== IS_NOT_VISIBLE) {
            back.obscuredDirection |= FRONT
            blocksToUpdate.push(back)
        }
        if (top && top.chunkIndex !== chunkIndex && top.obscuredDirection !== IS_NOT_VISIBLE) {
            top.obscuredDirection |= BOT
            blocksToUpdate.push(top)
        }
        if (bot && bot.chunkIndex !== chunkIndex && bot.obscuredDirection !== IS_NOT_VISIBLE) {
            bot.obscuredDirection |= TOP
            blocksToUpdate.push(bot)
        }
        if (right && right.chunkIndex !== chunkIndex && right.obscuredDirection !== IS_NOT_VISIBLE) {
            right.obscuredDirection |= LEFT
            blocksToUpdate.push(right)
        }
        if (left && left.chunkIndex !== chunkIndex && left.obscuredDirection !== IS_NOT_VISIBLE) {
            left.obscuredDirection |= RIGHT
            blocksToUpdate.push(left)
        }
        return blocksToUpdate
    }

    private computeBlock(x: number, y: number, z: number, yL: number) {
        return Gen.bioms.mountains.computeBlock(x, y, z, yL)
    }

    setBlock(block: Block) {
        Gen.chunks
            .find((c) => c.index === block.chunkIndex)
            ?.blocks.set(this.getKeyFromCoords(block.x, block.y, block.z), block)
    }

    getBlock(x: number, y: number, z: number) {
        if (y < 0) return undefined
        const chunk = Gen.chunks.find((chunk) => isBlockInChunkRange(chunk.x, chunk.z, x, z, Gen.width))
        if (!chunk) return undefined
        return chunk.blocks.get(this.getKeyFromCoords(x, y, z))
    }

    getCoordsFromKey(key: BigInt) {
        return keyToCoordinates(key)
    }

    getKeyFromCoords(x: number, y: number, z: number) {
        return coordinatesToKey(x, y, z)
    }
}

new Gen()
