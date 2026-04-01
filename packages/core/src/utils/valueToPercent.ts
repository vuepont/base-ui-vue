export function valueToPercent(value: number, min: number, max: number) {
  if (max === min) {
    return 0
  }

  return ((value - min) * 100) / (max - min)
}
