<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { FieldRootState } from '../root/FieldRoot.vue'
import { computed, ref, shallowRef, useAttrs, useTemplateRef, watchEffect } from 'vue'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { useAriaLabelledBy } from '../../labelable-provider/useAriaLabelledBy'
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
const templateRef = useTemplateRef<unknown>('control')

function isHTMLElement(value: unknown): value is HTMLElement {
  return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement
}

function resolveHTMLElement(value: unknown): HTMLElement | null {
  if (isHTMLElement(value)) {
    return value
  }
  if (value && typeof value === 'object' && '$el' in value) {
    const el = (value as { $el?: unknown }).$el
    if (isHTMLElement(el)) {
      return el
    }
  }
  return null
}

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
  const element = resolveHTMLElement(templateRef.value)
  inputElementRef.value = element
  validation.setInputRef(element as HTMLInputElement | null)
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

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(state.value, fieldValidityMapping)
  const inputValidationProps = validation.getInputValidationProps()

  const baseProps: Record<string, any> = {
    ...attrs,
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
    ref="control"
    v-bind="mergedProps"
    @input="handleInputCombined"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeydown"
  />
</template>
