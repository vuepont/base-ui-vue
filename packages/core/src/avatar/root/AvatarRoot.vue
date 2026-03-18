<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import { computed, provide, ref, useAttrs } from 'vue'
import { useRenderElement } from '../../utils/useRenderElement'
import { AvatarRootContextKey } from './AvatarRootContext'
import { avatarStateAttributesMapping } from './stateAttributesMapping'

export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface AvatarRootState {
  imageLoadingStatus: ImageLoadingStatus
}

export interface AvatarRootProps extends BaseUIComponentProps<AvatarRootState> { }

/**
 * Displays a user's profile picture, initials, or fallback icon.
 * Renders a \`<span>\` element.
 *
 * Documentation: [Base UI Avatar](https://base-ui-vue.com/components/avatar)
 */
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

const { tag, mergedProps, renderless } = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => ({
    ...attrs,
  })),
  stateAttributesMapping: avatarStateAttributesMapping,
  defaultTagName: 'span',
})
</script>

<template>
  <slot v-if="renderless" :props="mergedProps" :state="state" />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
