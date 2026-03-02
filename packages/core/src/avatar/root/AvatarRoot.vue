<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import { computed, provide, ref, useAttrs } from 'vue'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
import { AvatarRootContextKey } from './AvatarRootContext'
import { avatarStateAttributesMapping } from './stateAttributesMapping'

export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface AvatarRootState {
  imageLoadingStatus: ImageLoadingStatus
}

export interface AvatarRootProps extends BaseUIComponentProps<AvatarRootState> { }

// export namespace AvatarRoot {
//   export type State = AvatarRootState
//   export type Props = AvatarRootProps
// }

defineOptions({
  name: 'AvatarRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<AvatarRootProps>(), {
  as: 'span',
})

const attrs = useAttrs()

const imageLoadingStatus = ref<ImageLoadingStatus>('idle')

provide(AvatarRootContextKey, {
  imageLoadingStatus,
  setImageLoadingStatus: (status: ImageLoadingStatus) => {
    imageLoadingStatus.value = status
  },
})

const state = computed<AvatarRootState>(() => ({
  imageLoadingStatus: imageLoadingStatus.value,
}))

const mergedProps = computed(() => {
  return {
    ...attrs,
    class: typeof props.class === 'function' ? props.class(state.value) : props.class,
    style: typeof props.style === 'function' ? props.style(state.value) : props.style,
    ...getStateAttributesProps(state.value, avatarStateAttributesMapping),
  }
})
</script>

<template>
  <component :is="props.as" v-bind="mergedProps">
    <slot />
  </component>
</template>
