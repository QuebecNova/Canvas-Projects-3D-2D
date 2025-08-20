import { Math } from '@/lib/common/Math'
import { evaluate } from 'mathjs'

const realMoon = {
    x: 384400,
    m: 7.346e22,
    v: evaluate(`sqrt(5.972168e24/384400)`),
    r: 1737.4,
}

export const moon = {
    id: 'moon',
    x: -2000,
    y: -2000,
    m: 2e6,
    v: 50,
    a: 0,
    aθ: Math.degToRad(0),
    vθ: Math.degToRad(90),
    r: evaluate(`${600}*${1737 / 6371}`),
    color: 'gray',
}
