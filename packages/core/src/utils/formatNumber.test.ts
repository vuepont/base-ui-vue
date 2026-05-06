import { describe, expect, it } from 'vitest'
import { formatNumber, formatNumberValue } from './formatNumber'

describe('formatNumber', () => {
  it('formats a number using the given locale and options', () => {
    const result = formatNumber(1234.5, 'en-US', { style: 'decimal' })
    expect(result).toBe('1,234.5')
  })

  it('respects the provided locale', () => {
    const result = formatNumber(1234.5, 'de-DE', { style: 'decimal' })
    // In German locale, thousands use `.` and decimals use `,`
    expect(result).toBe('1.234,5')
  })
})

describe('formatNumberValue', () => {
  it('returns an empty string when the value is null', () => {
    expect(formatNumberValue(null)).toBe('')
  })

  it('formats the value as a percentage when no format is provided', () => {
    const expected = new Intl.NumberFormat(undefined, { style: 'percent' }).format(0.3)
    expect(formatNumberValue(30)).toBe(expected)
  })

  it('applies the provided format when one is given', () => {
    const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
    const expected = new Intl.NumberFormat(undefined, format).format(30)
    expect(formatNumberValue(30, undefined, format)).toBe(expected)
  })

  it('respects the provided locale when a format is given', () => {
    const format: Intl.NumberFormatOptions = { style: 'decimal', minimumFractionDigits: 2 }
    const expected = new Intl.NumberFormat('de-DE', format).format(86.49)
    expect(formatNumberValue(86.49, 'de-DE', format)).toBe(expected)
  })
})
