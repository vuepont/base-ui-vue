import { describe, expect, it } from 'vitest'
import { areArraysEqual } from './areArraysEqual'

describe('areArraysEqual', () => {
  it('returns false for arrays of different lengths', () => {
    expect(areArraysEqual([1], [1, 2])).toBe(false)
  })

  it('is order-sensitive', () => {
    expect(areArraysEqual([1, 2], [2, 1])).toBe(false)
  })

  it('uses strict equality by default', () => {
    expect(areArraysEqual([1, 2], [1, 2])).toBe(true)
    expect(areArraysEqual([1, 2], [1, 3])).toBe(false)
  })

  it('supports a custom comparer', () => {
    expect(areArraysEqual(['A', 'b'], ['a', 'B'], (a, b) => a.toLowerCase() === b.toLowerCase())).toBe(true)
  })
})
