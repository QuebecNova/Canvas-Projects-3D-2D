import { Math } from '@/common/Math'

const realEarth = {
    m: 5.972168e24,
    r: 6371,
}

export const earth = {
    id: 'earth',
    x: 0,
    y: 0,
    m: 2e7,
    v: 100,
    vθ: Math.degToRad(270),
    a: 0,
    aθ: Math.degToRad(0),
    r: 250,
    color: 'blue',
}

// 1km = 1000m
