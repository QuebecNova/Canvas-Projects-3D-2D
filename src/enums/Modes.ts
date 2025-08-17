import { ValueOf } from "../types/ValueOf"

export const Modes2D = {
        'RAYCASTING': 'raycasting',
        'GRAVISIM': 'gravisim'
} as const
export type Modes2D = ValueOf<typeof Modes2D>

export const Modes3D = {
        'ENGINE': 'engine'
} as const
export type Modes3D = ValueOf<typeof Modes3D>