type ReturnValue<T> = {
    ctx?: T
    canvas?: HTMLCanvasElement
}

export function getCanvas(
    id: string,
    context: '2d'
): ReturnValue<CanvasRenderingContext2D>

export function getCanvas(
    id: string,
    context: 'webgl'
): ReturnValue<WebGLRenderingContext>

export function getCanvas(
    id: string,
    context: 'webgl' | '2d'
): ReturnValue<WebGLRenderingContext | CanvasRenderingContext2D> {
    const canvas = document.getElementById(id) as HTMLCanvasElement
    if (!canvas) return {}
    let ctx: CanvasRenderingContext2D | WebGLRenderingContext | null = null
    if (context === 'webgl') {
        ctx = canvas.getContext('webgl')
    }
    if (context === '2d') {
        ctx = canvas.getContext('2d')
    }
    if (!ctx) return {}

    return { ctx, canvas }
}
