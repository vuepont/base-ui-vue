function getDecimalPrecision(num: number) {
  if (Math.abs(num) < 1) {
    const parts = num.toExponential().split('e-')
    const mantissaDecimalPart = parts[0].split('.')[1]
    return (mantissaDecimalPart ? mantissaDecimalPart.length : 0) + Number.parseInt(parts[1], 10)
  }

  const decimalPart = num.toString().split('.')[1]
  return decimalPart ? decimalPart.length : 0
}

export function roundValueToStep(value: number, step: number, min: number) {
  if (!Number.isFinite(step) || step <= 0) {
    return value
  }

  const nearest = Math.round((value - min) / step) * step + min
  return Number(nearest.toFixed(getDecimalPrecision(step)))
}
