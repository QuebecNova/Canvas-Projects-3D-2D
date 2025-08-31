import { Blocks } from '@/3D/entities/Blocks'
import { ChunkBuffers } from '../canvas/buffers/chunk';

export type Chunk = { index: number, x: number; z: number; blocks: Blocks, buffers?: ChunkBuffers }