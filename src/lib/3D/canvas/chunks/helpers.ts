import { Chunk } from '../../types/Chunk'

export function getMaxBlocksInChunk(width: number, height: number) {
    return width * width * height
}

export function getInstancesRange(maxBlocksCount: number, chunkIndex: number) {
    return { from: maxBlocksCount * chunkIndex, to: maxBlocksCount * (chunkIndex + 1) }
}

export function getChunkInfo(chunk: Chunk) {
    return `№${chunk.index}, x:${chunk.x}, z:${chunk.z}, size:${chunk.blocks.size}`
}

export function isBlockInChunkRange(chunkX: number, chunkZ: number, x: number, z: number, width: number) {
    return x >= chunkX && z >= chunkZ && x < chunkX + width && z < chunkZ + width
}

export function isBlockOnChunkBorder(chunkX: number, chunkZ: number, x: number, z: number, width: number) {
    return x === chunkX || z === chunkZ || x === (chunkX + width - 1) || z === (chunkZ + width - 1)
}
