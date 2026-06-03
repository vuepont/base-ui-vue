import { describe, expect, it } from 'vitest'
import { parseNumber } from './parse'
import { toValidatedNumber } from './validate'

describe('parseNumber', () => {
  it('parses plain integers', () => {
    expect(parseNumber('42')).toBe(42)
  })

  it('parses decimals', () => {
    expect(parseNumber('3.14')).toBe(3.14)
  })

  it('parses negative numbers', () => {
    expect(parseNumber('-7')).toBe(-7)
  })

  it('parses grouped numbers', () => {
    expect(parseNumber('1,000', 'en-US')).toBe(1000)
  })

  it('returns null for non-numeric input', () => {
    expect(parseNumber('abc')).toBe(null)
  })

  it('returns null for Infinity', () => {
    expect(parseNumber('Infinity')).toBe(null)
  })

  it('parses percentages relative to 100', () => {
    expect(parseNumber('50%', 'en-US', { style: 'percent' })).toBe(0.5)
  })
})

describe('toValidatedNumber', () => {
  const base = {
    step: undefined,
    minWithDefault: Number.MIN_SAFE_INTEGER,
    maxWithDefault: Number.MAX_SAFE_INTEGER,
    minWithZeroDefault: 0,
    format: undefined,
    snapOnStep: false,
    small: false,
    clamp: true,
  }

  it('passes through null', () => {
    expect(toValidatedNumber(null, base)).toBe(null)
  })

  it('clamps to the minimum', () => {
    expect(toValidatedNumber(-5, { ...base, minWithDefault: 0 })).toBe(0)
  })

  it('clamps to the maximum', () => {
    expect(toValidatedNumber(15, { ...base, maxWithDefault: 10 })).toBe(10)
  })

  it('does not clamp when clamp is false', () => {
    expect(toValidatedNumber(15, { ...base, maxWithDefault: 10, clamp: false })).toBe(15)
  })

  it('snaps to the nearest step when snapOnStep is enabled', () => {
    expect(
      toValidatedNumber(7, {
        ...base,
        step: 5,
        minWithDefault: 0,
        snapOnStep: true,
        small: true,
      }),
    ).toBe(5)
  })
})
