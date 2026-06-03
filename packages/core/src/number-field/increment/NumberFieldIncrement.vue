<script setup lang="ts">
import type { BaseUIComponentProps, NativeButtonProps } from '../../utils/types'
import type { NumberFieldRootState } from '../root/NumberFieldRoot.vue'
import { computed, useAttrs } from 'vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { useButton } from '../../use-button/useButton'
import { useRenderElement } from '../../utils/useRenderElement'
import { useNumberFieldRootContext } from '../root/NumberFieldRootContext'
import { useNumberFieldButton } from '../root/useNumberFieldButton'
import { stateAttributesMapping } from '../utils/stateAttributesMapping'

export type NumberFieldIncrementState = NumberFieldRootState

export interface NumberFieldIncrementProps
  extends NativeButtonProps, BaseUIComponentProps<NumberFieldIncrementState> {
  disabled?: boolean
}

defineOptions({
  name: 'NumberFieldIncrement',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<NumberFieldIncrementProps>(), {
  as: 'button',
  disabled: false,
  nativeButton: true,
})

const attrs = useAttrs()
const attrsObject = attrs as Record<string, any>

const {
  allowInputSyncRef,
  disabled: contextDisabled,
  formatOptionsRef,
  getStepAmount,
  id,
  incrementValue,
  inputRef,
  inputValue,
  locale,
  maxWithDefault,
  readOnly,
  setValue,
  state,
  value,
  valueRef,
  lastChangedValueRef,
  onValueCommitted,
} = useNumberFieldRootContext()

const isMax = computed(() => value.value != null && value.value >= maxWithDefault.value)
const disabled = computed(() => props.disabled || contextDisabled.value || isMax.value)

const buttonProps = useNumberFieldButton({
  isIncrement: true,
  inputRef,
  inputValue: () => inputValue.value,
  disabled: () => disabled.value,
  readOnly: () => readOnly.value,
  id: () => id.value,
  setValue,
  getStepAmount,
  incrementValue,
  allowInputSyncRef,
  formatOptionsRef,
  valueRef,
  locale: () => locale.value,
  lastChangedValueRef,
  onValueCommitted,
})

const { getButtonProps, buttonRef } = useButton({
  disabled: () => disabled.value,
  native: () => props.nativeButton,
  focusableWhenDisabled: true,
})

const buttonState = computed<NumberFieldIncrementState>(() => ({
  ...state.value,
  disabled: disabled.value,
}))

const combinedProps = computed(() =>
  mergeProps(buttonProps.value, attrsObject, getButtonProps()),
)

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state: buttonState,
  props: combinedProps,
  stateAttributesMapping,
  defaultTagName: 'button',
  ref: buttonRef,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="buttonState" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="buttonState" />
  </component>
</template>
