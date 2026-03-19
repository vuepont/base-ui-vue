import { describe, expect, it } from 'vitest'
import { isOnlyValueMissing } from './useFieldValidation'

describe('isOnlyValueMissing', () => {
  it('returns true when valueMissing is the only validity error', () => {
    expect(isOnlyValueMissing({
      badInput: false,
      customError: false,
      patternMismatch: false,
      rangeOverflow: false,
      rangeUnderflow: false,
      stepMismatch: false,
      tooLong: false,
      tooShort: false,
      typeMismatch: false,
      valueMissing: true,
      valid: false,
    })).toBe(true)
  })

  it('returns false when another validity error is also present', () => {
    expect(isOnlyValueMissing({
      badInput: false,
      customError: false,
      patternMismatch: false,
      rangeOverflow: false,
      rangeUnderflow: false,
      stepMismatch: false,
      tooLong: false,
      tooShort: false,
      typeMismatch: true,
      valueMissing: true,
      valid: false,
    })).toBe(false)
  })
})
