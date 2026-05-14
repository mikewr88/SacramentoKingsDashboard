export function safeDivide(numerator: number, denominator: number): number {
    return denominator > 0 ? numerator / denominator : 0;
}

export function toPercent(value: number): number {
    return value * 100;
}
