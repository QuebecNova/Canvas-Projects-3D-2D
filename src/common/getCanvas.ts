type ReturnValue<T> = {
    ctx?: T
    canvas?: HTMLCanvasElement
}

export function getCanvas(id: string, context: '2d'): ReturnValue<CanvasRenderingContext2D>

export function getCanvas(id: string, context: 'webgl'): ReturnValue<WebGL2RenderingContext>

export function getCanvas(
    id: string,
    context: 'webgl' | '2d'
): ReturnValue<WebGL2RenderingContext | CanvasRenderingContext2D> {
    const canvas = document.getElementById(id) as HTMLCanvasElement
    if (!canvas) return {}
    let ctx: CanvasRenderingContext2D | WebGL2RenderingContext | null = null
    if (context === 'webgl') {
        ctx = canvas.getContext('webgl2', { antialias: false })
        if (ctx === null) {
            alert('Unable to initialize WebGL2. Your browser or machine may not support it.')
            return {}
        }
    }
    if (context === '2d') {
        ctx = canvas.getContext('2d')
    }
    if (!ctx) return {}

    return { ctx, canvas }
}
