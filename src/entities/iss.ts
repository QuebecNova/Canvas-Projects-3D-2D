import { Math } from '@/lib/Math'
import { evaluate } from 'mathjs'

const realISS = {
    x: 384400,
    m: 7.346e22,
    v: evaluate(`sqrt(5.972168e24/384400)`),
    r: 1737.4,
}

export const ISS = {
    id: 'ISS',
    x: 2000,
    y: 200,
    m: 2e5,
    v: 100,
    a: 0,
    aθ: Math.convertDegToRad(0),
    vθ: Math.convertDegToRad(270),
    r: 200,
    color: 'yellow',
}
