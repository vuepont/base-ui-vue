import type { StyleValue } from 'vue'
import type { TransitionStatus } from './useTransitionStatus'
import { DISABLED_TRANSITIONS_STYLE, EMPTY_OBJECT } from './constants'

export function getDisabledMountTransitionStyles(transitionStatus: TransitionStatus): {
  style?: StyleValue
} {
  return transitionStatus === 'starting' ? DISABLED_TRANSITIONS_STYLE : EMPTY_OBJECT
}
