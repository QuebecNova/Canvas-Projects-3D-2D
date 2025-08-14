import { blackhole } from './entities/blackhole'
import { earth } from './entities/earth'
import { ISS } from './entities/iss'
import { moon } from './entities/moon'
import { venus } from './entities/venus'
import { Draw } from './lib/canvas/Draw'
import { System } from './lib/System'

let startDate: Date

const framerate = 60

function main() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    if (!canvas || !startDate) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const newDate = new Date()
    const elapsedTime = (newDate.getTime() - startDate.getTime()) / 1000

    ctx.save()

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const draw = new Draw({ canvas, ctx })
    draw.coordinates()
    const bodys = [earth, moon, ISS, venus, blackhole]
    // const bodys = [earth, moon, ]
    if (elapsedTime) {
        const system = new System(bodys)

        const Forces = system.simulateNBody(framerate / 1000)
        // Forces.forEach((force) => {
        //   draw.bodyVector(evaluate(`${force.F}/${bodys[force.n1].m}`), bodys[force.n1], force.coordinates.θ1);
        //   draw.bodyVector(evaluate(`${force.F}/${bodys[force.n2].m}`), bodys[force.n2], force.coordinates.θ2);
        // });
    }
    bodys.forEach((body) => {
        draw.body(body)
    })

    ctx.restore()

    window.requestAnimationFrame(main)
}

window.addEventListener('load', () => {
    startDate = new Date()
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    if (canvas) {
        Draw.addZoom(canvas)
    }
    window.requestAnimationFrame(main)
})
