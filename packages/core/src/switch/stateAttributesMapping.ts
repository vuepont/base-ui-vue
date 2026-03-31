import type { StateAttributesMapping } from '../utils/getStateAttributesProps'
import type { SwitchRootState } from './root/SwitchRoot.vue'
import { fieldValidityMapping } from '../field/utils/constants'
import { SwitchRootDataAttributes } from './root/SwitchRootDataAttributes'

const CHECKED_ATTRS: Record<string, string> = {
  [SwitchRootDataAttributes.checked]: '',
}

const UNCHECKED_ATTRS: Record<string, string> = {
  [SwitchRootDataAttributes.unchecked]: '',
}

export const stateAttributesMapping: StateAttributesMapping<SwitchRootState> = {
  ...fieldValidityMapping,
  checked(value) {
    if (value) {
      return CHECKED_ATTRS
    }

    return UNCHECKED_ATTRS
  },
}
