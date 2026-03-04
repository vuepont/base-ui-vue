import type { InjectionKey, Ref } from 'vue'
import type { ImageLoadingStatus } from './AvatarRoot.vue'
import { inject } from 'vue'

export interface AvatarRootContext {
  imageLoadingStatus: Ref<ImageLoadingStatus>
  setImageLoadingStatus: (status: ImageLoadingStatus) => void
}

export const AvatarRootContextKey: InjectionKey<AvatarRootContext>
  = Symbol('AvatarRootContext')

export function useAvatarRootContext() {
  const context = inject(AvatarRootContextKey, undefined)
  if (context === undefined) {
    throw new Error(
      'Base UI Vue: AvatarRootContext is missing. Avatar parts must be placed within <AvatarRoot>.',
    )
  }

  return context
}
