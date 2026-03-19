import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { FieldRootState, FieldValidityData } from '../root/FieldRoot.vue'
import { FieldRootDataAttributes } from '../root/FieldRootDataAttributes'

export const DEFAULT_VALIDITY_STATE: FieldValidityData['state'] = {
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valid: null,
  valueMissing: false,
}

export const DEFAULT_FIELD_STATE_ATTRIBUTES: Pick<
  FieldRootState,
  'valid' | 'touched' | 'dirty' | 'filled' | 'focused'
> = {
  valid: null,
  touched: false,
  dirty: false,
  filled: false,
  focused: false,
}

export const DEFAULT_FIELD_ROOT_STATE: FieldRootState = {
  disabled: false,
  ...DEFAULT_FIELD_STATE_ATTRIBUTES,
}

export const fieldValidityMapping: StateAttributesMapping<Pick<FieldRootState, 'valid'>> = {
  valid(value: boolean | null): Record<string, string> | null {
    if (value === null) {
      return null
    }
    if (value) {
      return { [FieldRootDataAttributes.valid]: '' }
    }
    return { [FieldRootDataAttributes.invalid]: '' }
  },
}
