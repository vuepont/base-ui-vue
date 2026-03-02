import type { ImageLoadingStatus } from '../root/AvatarRoot.vue'
import { ref, watchEffect } from 'vue'

interface UseImageLoadingStatusOptions {
  referrerPolicy?: HTMLImageElement['referrerPolicy']
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
}

export function useImageLoadingStatus(
  srcRef: any, // Can be a ref or raw value
  options: UseImageLoadingStatusOptions,
) {
  const loadingStatus = ref<ImageLoadingStatus>('idle')

  watchEffect((onCleanup) => {
    const src = typeof srcRef === 'function' ? srcRef() : srcRef?.value ?? srcRef

    if (!src) {
      loadingStatus.value = 'error'
      return
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

    if (options.referrerPolicy) {
      image.referrerPolicy = options.referrerPolicy
    }

    if (options.crossOrigin !== undefined) {
      image.crossOrigin = options.crossOrigin
    }

    image.src = src

    onCleanup(() => {
      isMounted = false
    })
  })

  return loadingStatus
}
