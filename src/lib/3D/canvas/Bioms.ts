import { Blocks, BlockTypes } from '../entities/Blocks'
import SimplexNoise from '../math/Noise'

type Generator = {
    noise: SimplexNoise
    computeBlock: (
        x: number,
        y: number,
        z: number,
        yL: number
    ) => {
        type: BlockTypes
        id: number
    }
}

export class Bioms {
    seed: number | string
    maxHeight: number
    mountains: Generator
    penetratedMountains: Generator
    plains: Generator
    // ocean: Generator
    floatingIslands: Generator
    // islands: Generator
    constructor(maxHeight: number, seed: number | string = Math.random()) {
        this.maxHeight = maxHeight
        this.seed = seed
        this.mountains = {
            noise: new SimplexNoise({
                octaves: 3,
                frequency: 1 / 70,
                persistence: 1.7,
                lacunarity: 1.2,
                amplitude: 20,
                elevation: -10,
                seed,
            }),
            computeBlock: (x, y, z) => {
                let type: BlockTypes = BlockTypes.AIR

                const height = this.mountains.noise.evaluate3D(x, y, z)
                const dirtLayerStartsAt = this.maxHeight / 4
                const bedrockLayer = 0
                if (y < height + 16 - dirtLayerStartsAt) {
                    type = BlockTypes.STONE
                }
                if (y === bedrockLayer) {
                    type = BlockTypes.BEDROCK
                } else if ((y >= dirtLayerStartsAt && y <= height) || height >= this.maxHeight) {
                    type = BlockTypes.DIRT
                } else if (y < height - 4 && type !== BlockTypes.AIR) {
                    type = BlockTypes.STONE
                }

                const id = Blocks[type].id
                return { type, id }
            },
        }
        this.penetratedMountains = {
            noise: new SimplexNoise({
                octaves: 3,
                frequency: 1 / 79,
                persistence: 1.9,
                lacunarity: 1.9,
                amplitude: 8,
                elevation: 5,
                seed,
            }),
            computeBlock: (x, y, z) => {
                let type: BlockTypes = BlockTypes.AIR
                const height = this.penetratedMountains.noise.evaluate3D(x, y, z)
                const dirtLayerStartsAt = this.maxHeight / 4
                const bedrockLayer = 0
                if (y < height + 4 - dirtLayerStartsAt) {
                    type = BlockTypes.STONE
                }
                if (y === bedrockLayer) {
                    type = BlockTypes.BEDROCK
                } else if (y >= dirtLayerStartsAt && y <= height) {
                    type = BlockTypes.DIRT
                }
                if (y < height - 4 && type !== BlockTypes.AIR) {
                    type = BlockTypes.STONE
                }

                const id = Blocks[type].id
                return { type, id }
            },
        }
        this.plains = {
            noise: new SimplexNoise({
                octaves: 3,
                frequency: 1 / 100,
                persistence: 0.5,
                lacunarity: 2.5,
                amplitude: 4,
                elevation: this.maxHeight - 5,
                seed,
            }),
            computeBlock: (x, y, z) => {
                let type: BlockTypes = BlockTypes.AIR

                const height = this.plains.noise.evaluate3D(x, y, z)
                const dirtLayerStartsAt = this.maxHeight - 5
                const bedrockLayer = 0

                if (y === bedrockLayer) {
                    type = BlockTypes.BEDROCK
                } else if (y >= dirtLayerStartsAt && y <= height) {
                    type = BlockTypes.DIRT
                } else if (y < height && y < dirtLayerStartsAt) {
                    type = BlockTypes.STONE
                }
                const id = Blocks[type].id
                return { type, id }
            },
        }
        this.floatingIslands = {
            noise: new SimplexNoise({
                octaves: 4,
                frequency: 1 / 4000,
                persistence: 7,
                lacunarity: 6.5,
                amplitude: 0.15,
                elevation: 2,
                seed,
            }),
            computeBlock: (x, y, z) => {
                let type: BlockTypes = BlockTypes.AIR

                const height = this.floatingIslands.noise.evaluate3D(x, y, z)
                const dirtLayerStartsAt = this.maxHeight - this.maxHeight / 1.5
                const bedrockLayer = 0

                if (y === bedrockLayer) {
                    type = BlockTypes.BEDROCK
                } else if (y >= dirtLayerStartsAt && y <= height) {
                    type = BlockTypes.DIRT
                } else if (y < height && y < dirtLayerStartsAt) {
                    type = BlockTypes.STONE
                }
                const id = Blocks[type].id
                return { type, id }
            },
        }
    }
}
