import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { OtpFieldInputState } from '../input/OtpFieldInput.vue'
import type { OtpFieldRootState } from '../root/OtpFieldRoot.vue'
import { fieldValidityMapping } from '../../field/utils/constants'

export const rootStateAttributesMapping: StateAttributesMapping<OtpFieldRootState> = {
  value: () => null,
  length: () => null,
  ...fieldValidityMapping,
}

export const inputStateAttributesMapping: StateAttributesMapping<OtpFieldInputState> = {
  value: () => null,
  index: () => null,
  ...fieldValidityMapping,
}
