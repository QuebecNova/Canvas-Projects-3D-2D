import { Modes2D, Modes3D } from './enums/Modes'
import { Draw2D } from './lib/2D/canvas/Draw'
import { Draw3D } from './lib/3D/canvas/Draw'
import { getCanvas } from './lib/common/getCanvas'

let startDate: Date

let mode: Modes2D | Modes3D = Modes2D.RAYCASTING

let draw2D: Draw2D | undefined
let draw3D: Draw3D | undefined

function is2D() {
    return ([Modes2D.GRAVISIM, Modes2D.RAYCASTING] as string[]).includes(mode)
}

function main2D(zoomFactor?: number) {
    if (!is2D()) return
    const { canvas, ctx } = getCanvas('canvas_2D_main', '2d')
    if (!canvas || !startDate || !ctx) return
    ctx.save()

    draw2D = new Draw2D({ canvas, ctx, startDate, zoomFactor })

    draw2D.addZoom()

    if (mode === Modes2D.RAYCASTING) {
        draw2D.raycasting()
    }
    if (mode === Modes2D.GRAVISIM) {
        draw2D.gravisim()
    }

    ctx.restore()
    requestAnimationFrame()
}

function main3D() {
    if (is2D()) return
    const { canvas, ctx } = getCanvas('canvas_3D_main', 'webgl')
    if (!canvas || !startDate || !ctx) return

    draw3D = new Draw3D({ canvas, ctx, startDate })

    requestAnimationFrame()
}

window.addEventListener('load', () => {
    startDate = new Date()
    addButtonListeners()
    setModeFromLocalStorage()
    requestAnimationFrame(mode === Modes2D.GRAVISIM ? 0.1 : 1)
})

function requestAnimationFrame(zoomFactor?: number) {
    if (is2D()) {
        window.requestAnimationFrame(() => main2D(zoomFactor))
    } else {
        window.requestAnimationFrame(main3D)
    }
}

function addButtonListeners() {
    const raycastingbtn = document.getElementById(Modes2D.RAYCASTING)
    const gravitybtn = document.getElementById(Modes2D.GRAVISIM)
    const engine3Dbtn = document.getElementById(Modes3D.ENGINE)
    if (raycastingbtn) {
        raycastingbtn.onclick = () => {
            setMode(Modes2D.RAYCASTING)
            if (draw2D) {
                draw2D.zoomFactor = 1
            }
            clear()
            //FIX: perfomance issues otherwise...
            window.location.reload()
        }
    }
    if (gravitybtn) {
        gravitybtn.onclick = () => {
            setMode(Modes2D.GRAVISIM)
            if (draw2D) {
                draw2D.zoomFactor = 0.1
            }
            clear()
            requestAnimationFrame()
        }
    }
    if (engine3Dbtn) {
        engine3Dbtn.onclick = () => {
            setMode(Modes3D.ENGINE)
            clear()
            requestAnimationFrame()
        }
    }
}

function setMode(newMode: Modes2D | Modes3D) {
    mode = newMode
    window.sessionStorage.setItem('mode', mode)
}

function setModeFromLocalStorage() {
    mode = (window.sessionStorage.getItem('mode') as Modes2D | Modes3D) || mode
}

function clear() {
    draw2D?.clear()
    draw3D?.clear()
}
