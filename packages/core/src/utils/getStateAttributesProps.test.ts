import { describe, expect, it } from 'vitest'
import { getStateAttributesProps } from './getStateAttributesProps'

describe('getStateAttributesProps', () => {
  it('converts the state fields to data attributes', () => {
    const state = {
      checked: true,
      orientation: 'vertical',
      count: 42,
    }

    const result = getStateAttributesProps(state)
    expect(result).toEqual({
      'data-checked': '',
      'data-orientation': 'vertical',
      'data-count': '42',
    })
  })

  it('changes the fields names to lowercase', () => {
    const state = {
      readOnly: true,
    }

    const result = getStateAttributesProps(state)
    expect(result).toEqual({
      'data-readonly': '',
    })
  })

  it('changes true values to a data-attribute without a value', () => {
    const state = {
      required: true,
      disabled: false,
    }

    const result = getStateAttributesProps(state)
    expect(result).toEqual({ 'data-required': '' })
  })

  it('does not include false or null/undefined values', () => {
    const state = {
      required: true,
      disabled: false,
      missing: null,
      omitted: undefined,
    }

    const result = getStateAttributesProps(state)
    expect(result).not.toHaveProperty('data-disabled')
    expect(result).not.toHaveProperty('data-missing')
    expect(result).not.toHaveProperty('data-omitted')
  })

  it('includes falsy values like 0 and empty strings (Vue specific improvement)', () => {
    const state = {
      count: 0,
      text: '',
    }

    const result = getStateAttributesProps(state)
    expect(result).toEqual({
      'data-count': '0',
      'data-text': '',
    })
  })

  it('supports custom mapping', () => {
    const state = {
      checked: true,
      orientation: 'vertical',
      count: 42,
    }

    const result = getStateAttributesProps(state, {
      checked: value => ({ 'data-state': value ? 'checked' : 'unchecked' }),
    })

    expect(result).toEqual({
      'data-state': 'checked',
      'data-orientation': 'vertical',
      'data-count': '42',
    })
  })

  it('supports nulls returned from custom mapping', () => {
    const state = {
      checked: false,
      orientation: 'vertical',
    }

    const result = getStateAttributesProps(state, {
      checked: value => (value === true ? { 'data-state': 'checked' } : null),
    })

    expect(result).toEqual({
      'data-orientation': 'vertical',
    })
  })
})
