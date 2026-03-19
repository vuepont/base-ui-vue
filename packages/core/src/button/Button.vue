<script setup lang="ts">
import type { ButtonProps } from './button.types'
import { computed, useAttrs } from 'vue'
import { useButton } from '../use-button'
import { useRenderElement } from '../utils/useRenderElement'

defineOptions({
  name: 'BaseUIButton',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ButtonProps>(), {
  as: 'button',
  disabled: false,
  focusableWhenDisabled: false,
  nativeButton: undefined,
})

const attrs = useAttrs()

const isNativeButton = computed(() => {
  if (props.nativeButton !== undefined) {
    return props.nativeButton
  }
  return typeof props.as === 'string' && props.as.toLowerCase() === 'button'
})

const { getButtonProps, buttonRef } = useButton({
  disabled: () => props.disabled,
  focusableWhenDisabled: () => props.focusableWhenDisabled,
  native: isNativeButton,
})

const state = computed(() => ({
  disabled: props.disabled,
}))

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => getButtonProps({
    ...attrs,
  })),
  defaultTagName: 'button',
  ref: buttonRef,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
