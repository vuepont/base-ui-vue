<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { FieldRootState } from '../root/FieldRoot.vue'
import { computed, ref, useAttrs, watchEffect } from 'vue'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { useLabelableId } from '../../labelable-provider/useLabelableId'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
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

const fieldContext = useFieldRootContext()

const {
  state: fieldState,
  name: fieldName,
  disabled: fieldDisabled,
  setTouched,
  setDirty,
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

const { labelId } = useLabelableContext()

const controlId = useLabelableId({ id: props.id })

const isControlled = computed(() => props.value !== undefined)
const internalValue = ref(props.defaultValue ?? '')

const currentValue = computed(() => {
  if (isControlled.value)
    return props.value!
  return internalValue.value
})

const inputElementRef = ref<HTMLElement | null>(null)

function setInputRef(el: any) {
  const element = (el?.$el ?? el) as HTMLElement | null
  inputElementRef.value = element
  validation.inputRef.value = element as HTMLInputElement | null
}

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
    validation.commit(target.value)
  }
}

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(state.value, fieldValidityMapping)
  const inputValidationProps = validation.getInputValidationProps()

  const baseProps: Record<string, any> = {
    ...attrs,
    'id': controlId.value,
    'disabled': disabled.value,
    'name': name.value,
    'aria-labelledby': labelId.value,
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
    'class': typeof props.class === 'function' ? props.class(state.value) : props.class,
    'style': typeof props.style === 'function' ? props.style(state.value) : props.style,
    ...stateAttributes,
    'value': isControlled.value ? props.value : internalValue.value,
  }

  for (const [key, val] of Object.entries(inputValidationProps)) {
    if (key === 'onInput')
      continue
    if (!(key in baseProps) || baseProps[key] === undefined) {
      baseProps[key] = val
    }
  }

  return baseProps
})
</script>

<template>
  <component
    :is="props.as"
    :ref="setInputRef"
    v-bind="mergedProps"
    @input="handleInputCombined"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeydown"
  />
</template>
