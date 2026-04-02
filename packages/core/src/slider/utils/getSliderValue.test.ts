import { describe, expect, it } from 'vitest'
import { getSliderValue } from './getSliderValue'
import { replaceArrayItemAtIndex } from './replaceArrayItemAtIndex'

describe('getSliderValue', () => {
  it('clamps single values to min and max', () => {
    expect(getSliderValue(-10, 0, 0, 100, false, [50])).toBe(0)
    expect(getSliderValue(120, 0, 0, 100, false, [50])).toBe(100)
  })

  it('clamps range values against zero-valued neighbors', () => {
    expect(getSliderValue(5, 0, -100, 100, true, [0, 0, 20])).toEqual([0, 0, 20])
    expect(getSliderValue(5, 1, -100, 100, true, [-10, 0, 10])).toEqual([-10, 5, 10])
  })

  it('handles first and last indices with undefined neighbors', () => {
    expect(getSliderValue(-20, 0, 0, 100, true, [10, 40])).toEqual([0, 40])
    expect(getSliderValue(120, 1, 0, 100, true, [10, 40])).toEqual([10, 100])
  })

  it('preserves other entries when replacing a ranged value', () => {
    expect(getSliderValue(55, 1, 0, 100, true, [10, 40, 80])).toEqual([10, 55, 80])
  })
})

describe('replaceArrayItemAtIndex', () => {
  it('preserves other entries and sorts the output', () => {
    expect(replaceArrayItemAtIndex([10, 40, 80], 1, 5)).toEqual([5, 10, 80])
  })

  it('throws for invalid indices', () => {
    expect(() => replaceArrayItemAtIndex([1, 2], -1, 0)).toThrow(RangeError)
    expect(() => replaceArrayItemAtIndex([1, 2], 2, 0)).toThrow(RangeError)
    expect(() => replaceArrayItemAtIndex([1, 2], 1.5, 0)).toThrow(RangeError)
  })
})
