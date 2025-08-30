import { coordinatesToKey, keyToCoordinates } from '../coordinates'

// function coordinatesToKey(x,y,z) {
// 	return `${x},${y},${z}`
// }

// function keyToCoordinates(key: string) {
// 	return key.split(',').map(v => Number.parseInt(v))
// }

// The difference is 1 second on 1 million keys

describe('Coordinates', () => {
    const testPoints: number[][] = new Array(10000).fill([]).map(() =>{
        return [
            Math.random() * 262000,
            Math.random() * 16383,
            Math.random() * 262000,
        ].map((v, index) => (index === 1 || (v > -1 && v < 1) || Math.random() > 0.5 ? Math.round(v) : -Math.round(v)))
    })

    test('Key to coordinates and back', () => {
        testPoints.forEach(([x1, y1, z1]) => {
            const [x, y, z] = keyToCoordinates(coordinatesToKey(x1, y1, z1))
            expect(x === 0 ? 0 : x).toBe(x1)
            expect(y === 0 ? 0 : y).toBe(y1)
            expect(z === 0 ? 0 : z).toBe(z1)
        })
    })

    test('Key to coordinates and back', () => {
        [[0,0,0]].forEach(([x1, y1, z1]) => {
            const [x, y, z] = keyToCoordinates(coordinatesToKey(x1, y1, z1))
            expect(x === 0 ? 0 : x).toBe(x1)
            expect(y === 0 ? 0 : y).toBe(y1)
            expect(z === 0 ? 0 : z).toBe(z1)
        })
    })
}, {timeout: 20000})
