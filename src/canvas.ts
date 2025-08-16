import { Draw } from './lib/canvas/Draw'

let startDate: Date

let mode: 'raycasting' | 'gravisim' = 'raycasting'

function main() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    if (!canvas || !startDate) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.save()

    const draw = new Draw({ canvas, ctx, startDate })
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

    addButtonListeners()

    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    if (canvas) {
        Draw.addZoom(canvas)
    }
    window.requestAnimationFrame(main)
})

function addButtonListeners() {
    const raycastingbtn = document.getElementById('raycasting')
    const gravitybtn = document.getElementById('gravisim')

    if (raycastingbtn) {
        raycastingbtn.onclick = () => {
            mode = 'raycasting'
            Draw.zoomFactor = 1
        }
    }
    if (gravitybtn) {
        gravitybtn.onclick = () => {
            Draw.clear()
            Draw.zoomFactor = 0.1
            mode = 'gravisim'
        }
    }
}
