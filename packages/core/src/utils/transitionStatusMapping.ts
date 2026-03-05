import type { StateAttributesMapping } from './getStateAttributesProps'
import type { TransitionStatus } from './useTransitionStatus'

export enum TransitionStatusDataAttributes {
  startingStyle = 'data-starting-style',
  endingStyle = 'data-ending-style',
}

const STARTING_HOOK = { [TransitionStatusDataAttributes.startingStyle]: '' }
const ENDING_HOOK = { [TransitionStatusDataAttributes.endingStyle]: '' }

export const transitionStatusMapping = {
  transitionStatus(value: TransitionStatus): Record<string, string> | null {
    if (value === 'starting') {
      return STARTING_HOOK
    }
    if (value === 'ending') {
      return ENDING_HOOK
    }
    return null
  },
} satisfies StateAttributesMapping<{ transitionStatus: TransitionStatus }>
