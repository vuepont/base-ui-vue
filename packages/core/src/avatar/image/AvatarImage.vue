<script setup lang="ts">
import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { BaseUIComponentProps } from '../../utils/types'
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import type { AvatarRootState } from '../root/AvatarRoot.vue'
import type { ImageLoadingStatus } from './useImageLoadingStatus'
import { computed, ref, useAttrs, watchEffect } from 'vue'
import { transitionStatusMapping } from '../../utils/stateAttributesMapping'
import { useOpenChangeComplete } from '../../utils/useOpenChangeComplete'
import { useRenderElement } from '../../utils/useRenderElement'
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

const stateAttributesMapping: StateAttributesMapping<AvatarImageState> = {
  ...avatarStateAttributesMapping,
  ...transitionStatusMapping,
}

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => ({
    ...attrs,
    src: props.src,
  })),
  stateAttributesMapping,
  defaultTagName: 'img',
  ref: imageRef,
})
</script>

<template>
  <slot v-if="renderless && mounted" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else-if="mounted" :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
