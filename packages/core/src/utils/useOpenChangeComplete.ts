import type { MaybeRefOrGetter } from 'vue'
import { toValue, watchEffect } from 'vue'
import { useAnimationsFinished } from './useAnimationsFinished'

export interface UseOpenChangeCompleteParameters {
  /**
   * Whether the hook is enabled.
   * @default true
   */
  enabled?: MaybeRefOrGetter<boolean | undefined>
  /**
   * Whether the element is open.
   */
  open?: MaybeRefOrGetter<boolean | undefined>
  /**
   * Ref to the element being closed.
   */
  ref: any
  /**
   * Function to call when the animation completes (or there is no animation).
   */
  onComplete: () => void
}

/**
 * Calls the provided function when the CSS open/close animation or transition completes.
 */
export function useOpenChangeComplete(
  parameters: UseOpenChangeCompleteParameters,
) {
  const runOnceAnimationsFinish = useAnimationsFinished(
    parameters.ref,
    parameters.open,
    false,
  )

  watchEffect((onCleanup) => {
    const enabled = toValue(parameters.enabled) ?? true

    if (!enabled) {
      return
    }

    const abortController = new AbortController()

    runOnceAnimationsFinish(parameters.onComplete, abortController.signal)

    onCleanup(() => {
      abortController.abort()
    })
  })
}
