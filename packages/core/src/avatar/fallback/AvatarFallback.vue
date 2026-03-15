<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { AvatarRootState } from '../root/AvatarRoot.vue'
import { computed, ref, useAttrs, watchEffect } from 'vue'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
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
  <component :is="props.as" v-if="isEnabled" v-bind="mergedProps">
    <slot />
  </component>
</template>
