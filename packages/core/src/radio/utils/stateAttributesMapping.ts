import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import { fieldValidityMapping } from '../../field/utils/constants'
import { transitionStatusMapping } from '../../utils/stateAttributesMapping'
import { RadioRootDataAttributes } from '../root/RadioRootDataAttributes'

const CHECKED_ATTRS: Record<string, string> = {
  [RadioRootDataAttributes.checked]: '',
}

const UNCHECKED_ATTRS: Record<string, string> = {
  [RadioRootDataAttributes.unchecked]: '',
}

export const stateAttributesMapping = {
  checked(value): Record<string, string> {
    if (value) {
      return CHECKED_ATTRS
    }

    return UNCHECKED_ATTRS
  },
  ...transitionStatusMapping,
  ...fieldValidityMapping,
} satisfies StateAttributesMapping<{
  checked: boolean
  transitionStatus: TransitionStatus
  valid: boolean | null
}>
