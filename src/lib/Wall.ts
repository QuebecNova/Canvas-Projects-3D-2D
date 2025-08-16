import { Coords } from '@/types/Coords'
import { Singleton } from './Singleton'

type InitialArguments = {
    id: string
    from: Coords
    to: Coords
    color?: string
}

export class Wall implements Singleton {
    id: string
    from: Coords
    to: Coords
    color: string
    private static instances: Wall[] = []

    constructor({ id, from, to, color = 'gray' }: InitialArguments) {
        this.id = 'wall.' + id
        this.from = from
        this.to = to
        this.color = color
        const wall = this.findOne(this.id)
        if (wall) {
            return wall
        } else {
            Wall.instances.push(this)
        }
    }

    findOne(id: string) {
        return Wall.instances.find((inctance) => inctance.id === id)
    }

    static clear() {
        Wall.instances = []
    }
}
