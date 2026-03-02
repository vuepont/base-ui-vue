<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import type { AvatarRootState, ImageLoadingStatus } from '../root/AvatarRoot.vue'
import { computed, ref, useAttrs, watchEffect } from 'vue'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
import { transitionStatusMapping } from '../../utils/stateAttributesMapping'
import { useOpenChangeComplete } from '../../utils/useOpenChangeComplete'
import { useTransitionStatus } from '../../utils/useTransitionStatus'
import { useAvatarRootContext } from '../root/AvatarRootContext'
import { avatarStateAttributesMapping } from '../root/stateAttributesMapping'
import { useImageLoadingStatus } from './useImageLoadingStatus'

export interface AvatarImageState extends AvatarRootState {
  transitionStatus: TransitionStatus
}

export interface AvatarImageProps extends BaseUIComponentProps<AvatarImageState> {
  src?: string
  referrerPolicy?: HTMLImageElement['referrerPolicy']
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
}

defineOptions({
  name: 'AvatarImage',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<AvatarImageProps>(), {
  as: 'img',
})

const emit = defineEmits<{
  (e: 'loadingStatusChange', status: ImageLoadingStatus): void
}>()

const attrs = useAttrs()
const imageRef = ref<HTMLImageElement | null>(null)

const context = useAvatarRootContext()

const imageLoadingStatus = useImageLoadingStatus(() => props.src, {
  referrerPolicy: props.referrerPolicy,
  crossOrigin: props.crossOrigin,
})

const isVisible = computed(() => imageLoadingStatus.value === 'loaded')

const { mounted, transitionStatus, setMounted } = useTransitionStatus(isVisible)

watchEffect(() => {
  if (imageLoadingStatus.value !== 'idle') {
    emit('loadingStatusChange', imageLoadingStatus.value)
    context.setImageLoadingStatus(imageLoadingStatus.value)
  }
})

const state = computed<AvatarImageState>(() => ({
  imageLoadingStatus: imageLoadingStatus.value,
  transitionStatus: transitionStatus.value,
}))

useOpenChangeComplete({
  open: isVisible,
  ref: imageRef,
  onComplete() {
    if (!isVisible.value) {
      setMounted(false)
    }
  },
})

const stateAttributesMapping = {
  ...avatarStateAttributesMapping,
  ...transitionStatusMapping,
}

const mergedProps = computed(() => {
  return {
    ...attrs,
    src: props.src,
    class: typeof props.class === 'function' ? props.class(state.value) : props.class,
    style: typeof props.style === 'function' ? props.style(state.value) : props.style,
    ...getStateAttributesProps(state.value, stateAttributesMapping),
  }
})
</script>

<template>
  <component :is="props.as" v-if="mounted" ref="imageRef" v-bind="mergedProps">
    <slot />
  </component>
</template>
