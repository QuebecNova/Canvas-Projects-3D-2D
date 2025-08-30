import { ValueOf } from '@/types/ValueOf'

export const BlockTypes = {
    AIR: 'air',
    DIRT: 'dirt',
    GRASS: 'grass',
    STONE: 'stone',
    BEDROCK: 'bedrock',
} as const
export type BlockTypes = ValueOf<typeof BlockTypes>

export const Blocks: {
    [key in BlockTypes]: {
        id: number
    }
} = {
    [BlockTypes.AIR]: {
        id: -1,
    },
    [BlockTypes.DIRT]: {
        id: 0,
    },
    [BlockTypes.GRASS]: {
        id: 2,
    },
    [BlockTypes.STONE]: {
        id: 3,
    },
    [BlockTypes.BEDROCK]: {
        id: 4,
    },
}

export type Block = {
    x: number
    y: number
    z: number
    id: number
    chunkIndex: number
    type: BlockTypes
    instanceId: number
    obscuredDirection: number
}

export type Blocks = Map<BigInt, Block>

export type KeyAndBlock = {key: BigInt, block: Block}

export const BlockBits = {
    FRONT: 1 << 0,
    BACK: 1 << 1,
    TOP: 1 << 2,
    BOT: 1 << 3,
    RIGHT: 1 << 4,
    LEFT: 1 << 5,
    IS_NOT_VISIBLE: 63,
}
