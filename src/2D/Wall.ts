import { Singleton } from '@/common/Singleton'
import { Coords2D } from '@/types/Coords'
import { random } from 'mathjs'

type InitialArguments = {
    id: string
    from: Coords2D
    to: Coords2D
    color?: string
}

export class Wall implements Singleton {
    id: string
    from: Coords2D
    to: Coords2D
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

    static random(halfWidth: number, halfHeight: number, count: number = 1) {
        const walls = []
        for (let i = 0; i < count; i++) {
            const wall = new Wall({
                id: random(0, 1).toString(),

                from: {
                    x: random(-halfWidth, halfWidth),
                    y: random(-halfHeight, halfHeight),
                },
                to: {
                    x: random(-halfWidth, halfWidth),
                    y: random(-halfHeight, halfHeight),
                },
            })
            walls.push(wall)
        }
        return walls
    }

    findOne(id: string) {
        return Wall.instances.find((inctance) => inctance.id === id)
    }

    static clear() {
        Wall.instances = []
    }
}
