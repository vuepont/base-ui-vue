import type { MaybeRefOrGetter } from 'vue'
import { ref, toValue, watchEffect } from 'vue'
import { NOOP } from '../../utils/noop'

export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface UseImageLoadingStatusOptions {
  referrerPolicy?: HTMLImageElement['referrerPolicy'] | undefined
  crossOrigin?: HTMLImageElement['crossOrigin'] | undefined
}

export function useImageLoadingStatus(
  srcRef: MaybeRefOrGetter<string | undefined>,
  { referrerPolicy, crossOrigin }: UseImageLoadingStatusOptions,
) {
  const loadingStatus = ref<ImageLoadingStatus>('idle')

  watchEffect((onCleanup) => {
    const src = toValue(srcRef)

    if (!src) {
      loadingStatus.value = 'error'
      return NOOP
    }

    let isMounted = true
    const image = new window.Image()

    const updateStatus = (status: ImageLoadingStatus) => () => {
      if (!isMounted) {
        return
      }
      loadingStatus.value = status
    }

    loadingStatus.value = 'loading'
    image.onload = updateStatus('loaded')
    image.onerror = updateStatus('error')

    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy
    }

    image.crossOrigin = crossOrigin ?? ''

    image.src = src

    onCleanup(() => {
      isMounted = false
    })
  })

  return loadingStatus
}
