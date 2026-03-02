import type { Ref } from 'vue'
import { isRef, watchEffect } from 'vue'
import { useAnimationsFinished } from './useAnimationsFinished'

export interface UseOpenChangeCompleteParameters {
  enabled?: boolean | Ref<boolean>
  open?: boolean | Ref<boolean>
  ref: any
  onComplete: () => void
}

export function useOpenChangeComplete(
  parameters: UseOpenChangeCompleteParameters,
) {
  const runOnceAnimationsFinish = useAnimationsFinished(
    parameters.ref,
    parameters.open,
    false,
  )

  watchEffect((onCleanup) => {
    const enabled = isRef(parameters.enabled)
      ? parameters.enabled.value
      : parameters.enabled !== false
    const open = isRef(parameters.open)
      ? parameters.open.value
      : parameters.open

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
