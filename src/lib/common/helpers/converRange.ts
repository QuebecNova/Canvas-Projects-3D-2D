type MinMax = {
    min: number
    max: number
}
export function convertRange(range: number[], newRange: MinMax): number[] {
    range.sort((a, b) => a - b)

    const oldMin = range[0]
    const oldMax = range[range.length - 1]
    const oldRange = oldMax - oldMin

    const updatedRange = range.map((value) => {
        let newValue
        if (oldRange == 0) newValue = newRange.min
        else {
            const newRangeDiff = newRange.max - newRange.min
            newValue =
                ((value - oldMin) * newRangeDiff) / oldRange + newRange.min
        }
        return newValue
    })

    return updatedRange
}

export function castValueToRange(
    value: number,
    oldRange: MinMax,
    newRange: MinMax
): number {
    const oldRangeDiff = oldRange.max - oldRange.min

    let newValue
    if (value == 0) newValue = newRange.min
    else {
        const newRangeDiff = newRange.max - newRange.min
        newValue =
            ((value - oldRange.min) * newRangeDiff) / oldRangeDiff +
            newRange.min
    }
    return newValue
}
