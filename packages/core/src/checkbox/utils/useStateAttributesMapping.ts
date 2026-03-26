import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { CheckboxRootState } from '../root/CheckboxRoot.vue'
import { fieldValidityMapping } from '../../field/utils/constants'
import { CheckboxRootDataAttributes } from '../root/CheckboxRootDataAttributes'

const CHECKED_ATTRS: Record<string, string> = {
  [CheckboxRootDataAttributes.checked]: '',
}
const UNCHECKED_ATTRS: Record<string, string> = {
  [CheckboxRootDataAttributes.unchecked]: '',
}

export function useCheckboxStateAttributesMapping(
  state: Readonly<{ value: CheckboxRootState }>,
): StateAttributesMapping<CheckboxRootState> {
  return {
    checked(value) {
      if (state.value.indeterminate) {
        return null
      }

      if (value) {
        return CHECKED_ATTRS
      }

      return UNCHECKED_ATTRS
    },
    ...fieldValidityMapping,
  }
}
