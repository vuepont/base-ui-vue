import type { CheckboxRootState } from '../root/CheckboxRoot.vue'
import { describe, expect, it } from 'vitest'
import { CheckboxRootDataAttributes } from '../root/CheckboxRootDataAttributes'
import { useCheckboxStateAttributesMapping } from './useStateAttributesMapping'

function createState(overrides: Partial<CheckboxRootState> = {}): Readonly<{ value: CheckboxRootState }> {
  return {
    value: {
      checked: false,
      disabled: false,
      readOnly: false,
      required: false,
      indeterminate: false,
      valid: null,
      touched: false,
      dirty: false,
      filled: false,
      focused: false,
      ...overrides,
    },
  }
}

describe('useCheckboxStateAttributesMapping', () => {
  it('returns null for checked mapping when indeterminate', () => {
    const mapping = useCheckboxStateAttributesMapping(
      createState({ indeterminate: true, checked: true }),
    )

    expect(mapping.checked?.(true)).toBeNull()
  })

  it('returns checked attrs when checked and not indeterminate', () => {
    const mapping = useCheckboxStateAttributesMapping(
      createState({ indeterminate: false, checked: true }),
    )

    expect(mapping.checked?.(true)).toEqual({
      [CheckboxRootDataAttributes.checked]: '',
    })
  })

  it('returns unchecked attrs when unchecked and not indeterminate', () => {
    const mapping = useCheckboxStateAttributesMapping(
      createState({ indeterminate: false, checked: false }),
    )

    expect(mapping.checked?.(false)).toEqual({
      [CheckboxRootDataAttributes.unchecked]: '',
    })
  })

  it('preserves field validity mapping', () => {
    const mapping = useCheckboxStateAttributesMapping(
      createState({ valid: true }),
    )

    expect(mapping.valid?.(true)).toEqual({
      [CheckboxRootDataAttributes.valid]: '',
    })
    expect(mapping.valid?.(false)).toEqual({
      [CheckboxRootDataAttributes.invalid]: '',
    })
  })
})
