import { Draw2D } from './lib/2D/canvas/Draw'
import { Modes2D, Modes3D } from './enums/Modes'

let startDate: Date

let mode: Modes2D | Modes3D = Modes2D.RAYCASTING

let draw2D: Draw2D

function main() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    if (!canvas || !startDate) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.save()

    draw2D = new Draw2D({ canvas, ctx, startDate })

    addButtonListeners()
    draw2D.addZoom()

    if (mode === Modes2D.RAYCASTING) {
        draw2D.raycasting()
    }
    if (mode === Modes2D.GRAVISIM) {
        draw2D.gravisim()
    }

    ctx.restore()
    window.requestAnimationFrame(main)
}

window.addEventListener('load', () => {
    startDate = new Date()

    window.requestAnimationFrame(main)
})

function addButtonListeners() {
    const raycastingbtn = document.getElementById(Modes2D.RAYCASTING)
    const gravitybtn = document.getElementById(Modes2D.GRAVISIM)
    if (raycastingbtn) {
        raycastingbtn.onclick = () => {
            mode = Modes2D.RAYCASTING
            draw2D.zoomFactor = 1
        }
    }
    if (gravitybtn) {
        gravitybtn.onclick = () => {
            mode = Modes2D.GRAVISIM
            draw2D.zoomFactor = 0.1
            Draw2D.clear()
        }
    }
}
