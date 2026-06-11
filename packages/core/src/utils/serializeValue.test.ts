import { describe, expect, it } from 'vitest'
import { serializeValue } from './serializeValue'

describe('serializeValue', () => {
  it('returns nullish values as an empty string', () => {
    expect(serializeValue(null)).toBe('')
    expect(serializeValue(undefined)).toBe('')
  })

  it('returns strings unchanged', () => {
    expect(serializeValue('a')).toBe('a')
  })

  it('serializes non-string values with JSON', () => {
    expect(serializeValue({ id: 1 })).toBe('{"id":1}')
  })

  it('returns a fallback string when JSON does not serialize the value', () => {
    function unstringifiable() {
      return undefined
    }

    expect(serializeValue(unstringifiable)).toBe('null')
    expect(serializeValue(Symbol('value'))).toBe('null')
  })
})
