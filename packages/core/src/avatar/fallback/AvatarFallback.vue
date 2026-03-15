<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { AvatarRootState } from '../root/AvatarRoot.vue'
import { computed, ref, useAttrs, watchEffect } from 'vue'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTimeout } from '../../utils/useTimeout'
import { useAvatarRootContext } from '../root/AvatarRootContext'
import { avatarStateAttributesMapping } from '../root/stateAttributesMapping'

export interface AvatarFallbackState extends AvatarRootState { }

export interface AvatarFallbackProps extends BaseUIComponentProps<AvatarFallbackState> {
  /**
   * How long to wait before showing the fallback. Specified in milliseconds.
   */
  delay?: number
}

defineOptions({
  name: 'AvatarFallback',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<AvatarFallbackProps>(), {
  as: 'span',
})

const attrs = useAttrs()

const { imageLoadingStatus } = useAvatarRootContext()

const delayPassed = ref(props.delay === undefined)
const timeout = useTimeout()

watchEffect((onCleanup) => {
  if (props.delay !== undefined) {
    delayPassed.value = false
    timeout.start(props.delay, () => {
      delayPassed.value = true
    })
  }
  else {
    delayPassed.value = true
  }

  onCleanup(() => {
    timeout.clear()
  })
})

const state = computed<AvatarFallbackState>(() => ({
  imageLoadingStatus: imageLoadingStatus.value,
}))

const isEnabled = computed(() => {
  return imageLoadingStatus.value !== 'loaded' && delayPassed.value
})

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
  <slot v-if="renderless && isEnabled" :props="mergedProps" :state="state" />
  <component :is="tag" v-else-if="isEnabled" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
