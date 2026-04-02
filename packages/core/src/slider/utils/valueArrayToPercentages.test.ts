import { describe, expect, it } from 'vitest'
import { valueArrayToPercentages } from './valueArrayToPercentages'

describe('valueArrayToPercentages', () => {
  it('converts values to percentages and clamps to 0-100', () => {
    expect(valueArrayToPercentages([-10, 0, 50, 100, 120], 0, 100)).toEqual([0, 0, 50, 100, 100])
  })

  it('returns 0 for a zero-width range', () => {
    expect(valueArrayToPercentages([10, 10, 10], 10, 10)).toEqual([0, 0, 0])
  })
})
