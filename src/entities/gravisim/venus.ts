import { Math } from '@/lib/common/Math'
import { evaluate } from 'mathjs'

const realMoon = {
    x: 384400,
    m: 7.346e22,
    v: evaluate(`sqrt(5.972168e24/384400)`),
    r: 1737.4,
}

export const venus = {
    id: 'venus',
    x: -1000,
    y: 2000,
    m: 2.35e6,
    v: 50,
    a: 0,
    aθ: Math.convertDegToRad(0),
    vθ: Math.convertDegToRad(0),
    r: evaluate(`${600}*${1737 / 6371}`),
    color: 'pink',
}
