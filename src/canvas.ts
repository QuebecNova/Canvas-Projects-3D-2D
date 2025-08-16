import { Draw } from './lib/canvas/Draw'

let startDate: Date

let mode: 'raycasting' | 'gravisim' = 'raycasting'

let draw: Draw

function main() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    if (!canvas || !startDate) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.save()

    draw = new Draw({ canvas, ctx, startDate })

    addButtonListeners()
    draw.addZoom()

    if (mode === 'raycasting') {
        draw.raycasting()
    }
    if (mode === 'gravisim') {
        draw.gravisim()
    }

    ctx.restore()
    window.requestAnimationFrame(main)
}

window.addEventListener('load', () => {
    startDate = new Date()

    window.requestAnimationFrame(main)
})

function addButtonListeners() {
    const raycastingbtn = document.getElementById('raycasting')
    const gravitybtn = document.getElementById('gravisim')
    if (raycastingbtn) {
        raycastingbtn.onclick = () => {
            mode = 'raycasting'
            draw.zoomFactor = 1
        }
    }
    if (gravitybtn) {
        gravitybtn.onclick = () => {
            mode = 'gravisim'
            draw.zoomFactor = 0.1
            Draw.clear()
        }
    }
}
