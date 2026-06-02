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

export type NumberFieldDecrementState = NumberFieldRootState

export interface NumberFieldDecrementProps
  extends NativeButtonProps, BaseUIComponentProps<NumberFieldDecrementState> {
  disabled?: boolean
}

defineOptions({
  name: 'NumberFieldDecrement',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<NumberFieldDecrementProps>(), {
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
  minWithDefault,
  readOnly,
  setValue,
  state,
  value,
  valueRef,
  locale,
  lastChangedValueRef,
  onValueCommitted,
} = useNumberFieldRootContext()

const isMin = computed(() => value.value != null && value.value <= minWithDefault.value)
const disabled = computed(() => props.disabled || contextDisabled.value || isMin.value)

const buttonProps = useNumberFieldButton({
  isIncrement: false,
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

const buttonState = computed<NumberFieldDecrementState>(() => ({
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
