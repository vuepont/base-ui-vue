import type { MaybeRefOrGetter } from 'vue'
import { computed, ref, toValue, watchEffect } from 'vue'
import { AnimationFrame } from './useAnimationFrame'

export type TransitionStatus = 'starting' | 'ending' | 'idle' | undefined

/**
 * Provides a status string for CSS animations.
 * @param openRef - a boolean that determines if the element is open.
 * @param enableIdleStateRef - a boolean that enables the `'idle'` state between `'starting'` and `'ending'`
 * @param deferEndingStateRef - a boolean that defers the `'ending'` state.
 */
export function useTransitionStatus(
  openRef: MaybeRefOrGetter<boolean>,
  enableIdleStateRef: MaybeRefOrGetter<boolean> = false,
  deferEndingStateRef: MaybeRefOrGetter<boolean> = false,
) {
  const open = computed(() => toValue(openRef))
  const enableIdleState = computed(() => toValue(enableIdleStateRef))
  const deferEndingState = computed(() => toValue(deferEndingStateRef))

  const transitionStatus = ref<TransitionStatus>(
    open.value && enableIdleState.value ? 'idle' : undefined,
  )
  const mounted = ref(open.value)

  watchEffect(() => {
    if (open.value && !mounted.value) {
      mounted.value = true
      transitionStatus.value = 'starting'
    }

    if (!open.value && mounted.value && transitionStatus.value !== 'ending' && !deferEndingState.value) {
      transitionStatus.value = 'ending'
    }

    if (!open.value && !mounted.value && transitionStatus.value === 'ending') {
      transitionStatus.value = undefined
    }
  })

  watchEffect((onCleanup) => {
    if (!open.value && mounted.value && transitionStatus.value !== 'ending' && deferEndingState.value) {
      const frame = AnimationFrame.request(() => {
        transitionStatus.value = 'ending'
      })

      onCleanup(() => {
        AnimationFrame.cancel(frame)
      })
    }
  })

  watchEffect((onCleanup) => {
    if (!open.value || enableIdleState.value) {
      return
    }

    const frame = AnimationFrame.request(() => {
      transitionStatus.value = undefined
    })

    onCleanup(() => {
      AnimationFrame.cancel(frame)
    })
  })

  watchEffect((onCleanup) => {
    if (!open.value || !enableIdleState.value) {
      return
    }

    if (open.value && mounted.value && transitionStatus.value !== 'idle') {
      transitionStatus.value = 'starting'
    }

    const frame = AnimationFrame.request(() => {
      transitionStatus.value = 'idle'
    })

    onCleanup(() => {
      AnimationFrame.cancel(frame)
    })
  })

  return {
    mounted,
    setMounted(value: boolean) {
      mounted.value = value
    },
    transitionStatus,
  }
}
