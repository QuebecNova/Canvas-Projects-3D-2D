import { Body } from '@/lib/Body'
import { Math } from '@/lib/Math'

export const blackhole = new Body({
    x: 1000,
    y: 200,
    m: 3.5e7,
    v: 0,
    vθ: Math.convertDegToRad(90),
    a: 0,
    aθ: Math.convertDegToRad(0),
    r: 200,
    color: 'black',
})
