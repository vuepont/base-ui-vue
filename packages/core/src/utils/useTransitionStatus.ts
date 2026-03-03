import type { Ref } from 'vue'
import { ref, watch } from 'vue'

export type TransitionStatus = 'starting' | 'ending' | 'idle' | undefined

export interface UseTransitionStatusReturnValue {
  mounted: Ref<boolean>
  setMounted: (next: boolean) => void
  transitionStatus: Ref<TransitionStatus>
}

/**
 * Provides a transition status string for CSS animations.
 * Port of React Base UI's `useTransitionStatus`.
 *
 * @param open - Reactive ref indicating whether the element is open.
 * @param enableIdleState - Enables the `'idle'` state between `'starting'` and `'ending'`.
 * @param deferEndingState - Defers `'ending'` by one animation frame to avoid conflicts.
 */
export function useTransitionStatus(
  open: Ref<boolean>,
  enableIdleState = false,
  deferEndingState = false,
): UseTransitionStatusReturnValue {
  const transitionStatus = ref<TransitionStatus>(
    open.value && enableIdleState ? 'idle' : undefined,
  )
  const mounted = ref(open.value)

  watch(
    open,
    (isOpen) => {
      if (isOpen) {
        mounted.value = true
        transitionStatus.value = 'starting'

        if (enableIdleState) {
          requestAnimationFrame(() => {
            transitionStatus.value = 'idle'
          })
        }
        else {
          requestAnimationFrame(() => {
            transitionStatus.value = undefined
          })
        }
      }
      else {
        if (deferEndingState) {
          requestAnimationFrame(() => {
            transitionStatus.value = 'ending'
          })
        }
        else {
          transitionStatus.value = 'ending'
        }
      }
    },
    { flush: 'sync' },
  )

  watch(
    transitionStatus,
    (status) => {
      if (!open.value && !mounted.value && status === 'ending') {
        transitionStatus.value = undefined
      }
    },
    { flush: 'sync' },
  )

  function setMounted(next: boolean) {
    mounted.value = next
  }

  return {
    mounted,
    setMounted,
    transitionStatus,
  }
}
