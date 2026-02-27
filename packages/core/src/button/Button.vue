<script setup lang="ts">
import type { ButtonProps } from './button.types'
import { computed, useAttrs } from 'vue'
import { useButton } from '../use-button'
import { getStateAttributesProps } from '../utils/getStateAttributesProps'

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

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(state.value)
  return getButtonProps({
    ...attrs,
    class: typeof props.class === 'function' ? props.class(state.value) : props.class,
    style: typeof props.style === 'function' ? props.style(state.value) : props.style,
    ...stateAttributes,
  })
})
</script>

<template>
  <component :is="props.as" ref="buttonRef" v-bind="mergedProps">
    <slot />
  </component>
</template>
