<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { FieldRootState } from '../root/FieldRoot.vue'
import { computed, ref, shallowRef, useAttrs, watchEffect } from 'vue'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { useAriaLabelledBy } from '../../labelable-provider/useAriaLabelledBy'
import { useLabelableId } from '../../labelable-provider/useLabelableId'
import { mergeProps } from '../../merge-props/mergeProps'
import { useRenderElement } from '../../utils/useRenderElement'
import { useFieldRootContext } from '../root/FieldRootContext'
import { useField } from '../useField'
import { fieldValidityMapping } from '../utils/constants'

export type FieldControlState = FieldRootState

export interface FieldControlProps extends BaseUIComponentProps<FieldControlState> {
  id?: string
  name?: string
  disabled?: boolean
  value?: string
  defaultValue?: string
  autofocus?: boolean
  type?: string
  required?: boolean
  pattern?: string
  minlength?: number
  maxlength?: number
  min?: string | number
  max?: string | number
  step?: string | number
  placeholder?: string
}

defineOptions({
  name: 'FieldControl',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FieldControlProps>(), {
  as: 'input',
  disabled: false,
  autofocus: false,
})

const emit = defineEmits<{
  valueChange: [value: string, event: Event]
}>()

const attrs = useAttrs()
const attrsObject = attrs as Record<string, any>

const fieldContext = useFieldRootContext()

const {
  state: fieldState,
  name: fieldName,
  disabled: fieldDisabled,
  setTouched,
  setDirty,
  markedDirtyRef,
  validityData,
  setFocused,
  setFilled,
  validationMode,
  validation,
} = fieldContext

const disabled = computed(() => fieldDisabled.value || props.disabled)
const name = computed(() => fieldName.value ?? props.name)

const state = computed<FieldControlState>(() => ({
  ...fieldState.value,
  disabled: disabled.value,
}))

const controlId = useLabelableId({ id: props.id })

const isControlled = computed(() => props.value !== undefined)
const internalValue = shallowRef(props.defaultValue ?? '')

const currentValue = computed(() => {
  if (isControlled.value)
    return props.value!
  return internalValue.value
})

const inputElementRef = ref<HTMLElement | null>(null)

const { labelId } = useLabelableContext()
const ariaLabelledByAttr = computed(() => attrs['aria-labelledby'] as string | undefined)
const ariaLabelledBy = useAriaLabelledBy({
  ariaLabelledBy: ariaLabelledByAttr,
  labelId,
  labelSourceRef: inputElementRef,
  enableFallback: true,
  labelSourceId: controlId.value ?? undefined,
})

watchEffect(() => {
  validation.setInputRef(inputElementRef.value as HTMLInputElement | null)
})

useField({
  id: controlId,
  name,
  commit: (v: unknown) => validation.commit(v),
  value: currentValue,
  getValue: () => (inputElementRef.value as HTMLInputElement)?.value ?? internalValue.value,
  controlRef: inputElementRef,
})

watchEffect(() => {
  const el = inputElementRef.value as HTMLInputElement | null
  if (!el)
    return

  if (el.value || (isControlled.value && props.value !== '')) {
    setFilled(true)
  }
  else if (isControlled.value && props.value === '') {
    setFilled(false)
  }
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  internalValue.value = target.value
  emit('valueChange', target.value, event)
  setDirty(target.value !== validityData.value.initialValue)
  setFilled(target.value !== '')
}

function handleInputCombined(event: Event) {
  handleInput(event)
  const inputValidationProps = validation.getInputValidationProps()
  inputValidationProps.onInput?.(event)
}

function handleFocus() {
  setFocused(true)
}

function handleBlur(event: Event) {
  const target = event.target as HTMLInputElement
  setTouched(true)
  setFocused(false)

  if (validationMode.value === 'onBlur') {
    validation.commit(target.value)
  }
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLInputElement
  if (target.tagName === 'INPUT' && event.key === 'Enter') {
    setTouched(true)
    markedDirtyRef.value = true
    validation.commit(target.value)
  }
}

const controlProps = computed(() => mergeProps(
  attrsObject,
  validation.getInputValidationProps(),
  {
    'id': controlId.value,
    'disabled': disabled.value,
    'name': name.value,
    'aria-labelledby': ariaLabelledBy.value,
    'autofocus': props.autofocus || undefined,
    'type': props.type,
    'required': props.required,
    'pattern': props.pattern,
    'minlength': props.minlength,
    'maxlength': props.maxlength,
    'min': props.min,
    'max': props.max,
    'step': props.step,
    'placeholder': props.placeholder,
    'value': isControlled.value ? props.value : internalValue.value,
    'onInput': handleInputCombined,
    'onFocus': handleFocus,
    'onBlur': handleBlur,
    'onKeydown': handleKeydown,
  },
))

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: controlProps,
  stateAttributesMapping: fieldValidityMapping,
  defaultTagName: 'input',
  ref: inputElementRef,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component
    :is="tag"
    v-else
    :ref="renderRef"
    v-bind="mergedProps"
  />
</template>
