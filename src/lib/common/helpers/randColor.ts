import { random, round } from 'mathjs'

export function randColor() {
    const colors = [
        'green',
        'black',
        'blue',
        'yellow',
        'pink',
        'magenta',
        'orange',
        'aquamarine',
        'blueviolet',
        'coral',
        'khaki',
        'olive',
        'limegreen',
        'white',
        'mistyrose',
        'navy',
        'royalblue',
        'tomato',
        'mocassin',
        'lightsalmon',
        'indigo',
        'fuchsia',
        'gray',
    ]
    const index = round(random(0, colors.length))
    return colors[index]
}
