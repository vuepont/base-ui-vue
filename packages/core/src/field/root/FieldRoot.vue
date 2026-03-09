<script setup lang="ts">
import type { FormValidationMode } from '../../form/FormContext'
import type { LabelableContext } from '../../labelable-provider/LabelableContext'
import type { BaseUIComponentProps } from '../../utils/types'
import type { FieldRootContext } from './FieldRootContext'
import { computed, provide, ref, useAttrs } from 'vue'
import { useFieldsetRootContext } from '../../fieldset/root/FieldsetRootContext'
import { useFormContext } from '../../form/FormContext'
import { labelableContextKey, useLabelableContext } from '../../labelable-provider/LabelableContext'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
import { DEFAULT_VALIDITY_STATE, fieldValidityMapping } from '../utils/constants'
import { fieldRootContextKey } from './FieldRootContext'
import { useFieldValidation } from './useFieldValidation'

export interface FieldValidityData {
  state: {
    badInput: boolean
    customError: boolean
    patternMismatch: boolean
    rangeOverflow: boolean
    rangeUnderflow: boolean
    stepMismatch: boolean
    tooLong: boolean
    tooShort: boolean
    typeMismatch: boolean
    valueMissing: boolean
    valid: boolean | null
  }
  error: string
  errors: string[]
  value: unknown
  initialValue: unknown
}

export interface FieldRootExpose {
  validate: () => void
}

export interface FieldRootState {
  disabled: boolean
  touched: boolean
  dirty: boolean
  valid: boolean | null
  filled: boolean
  focused: boolean
}

export interface FieldRootProps extends BaseUIComponentProps<FieldRootState> {
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean
  /**
   * Identifies the field when a form is submitted.
   */
  name?: string
  /**
   * A function for custom validation.
   */
  validate?: (
    value: unknown,
    formValues: Record<string, unknown>,
  ) => string | string[] | null | Promise<string | string[] | null>
  /**
   * Determines when the field should be validated.
   * @default 'onSubmit'
   */
  validationMode?: FormValidationMode
  /**
   * How long to wait between `validate` callbacks if
   * `validationMode="onChange"` is used. Specified in milliseconds.
   * @default 0
   */
  validationDebounceTime?: number
  /**
   * Whether the field is invalid.
   */
  invalid?: boolean
  /**
   * Whether the field's value has been changed from its initial value.
   */
  dirty?: boolean
  /**
   * Whether the field has been touched.
   */
  touched?: boolean
}

defineOptions({
  name: 'FieldRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FieldRootProps>(), {
  as: 'div',
  disabled: false,
  validationDebounceTime: 0,
  touched: undefined,
  dirty: undefined,
  invalid: undefined,
})

const attrs = useAttrs()

const {
  validationMode: formValidationMode,
  submitAttempted,
} = useFormContext()

const fieldsetContext = useFieldsetRootContext(true)

const disabledFieldset = computed(() => fieldsetContext?.disabled.value ?? false)
const disabled = computed(() => disabledFieldset.value || props.disabled)
const nameRef = computed(() => props.name)
const validationModeRef = computed(() => props.validationMode ?? formValidationMode.value)
const validationDebounceTimeRef = computed(() => props.validationDebounceTime)

const validateFn = computed(() => props.validate ?? (() => null))

const parentLabelable = useLabelableContext()

const controlId = ref<string | null | undefined>(undefined)
const labelId = ref<string | undefined>(undefined)
const messageIds = ref<string[]>([])

function setControlId(id: string | null | undefined) {
  controlId.value = id
}

function setLabelId(id: string | undefined) {
  labelId.value = id
}

function setMessageIds(updater: (ids: string[]) => string[]) {
  messageIds.value = updater(messageIds.value)
}

function getDescriptionProps() {
  const parentIds = parentLabelable.messageIds.value
  const allIds = parentIds.concat(messageIds.value)
  const describedBy = allIds.join(' ') || undefined
  return { 'aria-describedby': describedBy }
}

const labelableContext: LabelableContext = {
  controlId,
  setControlId,
  labelId,
  setLabelId,
  messageIds,
  setMessageIds,
  getDescriptionProps,
}

provide(labelableContextKey, labelableContext)

const touchedState = ref(false)
const dirtyState = ref(false)
const filled = ref(false)
const focused = ref(false)
const markedDirtyRef = ref(false)

const touched = computed(() => props.touched ?? touchedState.value)
const dirty = computed(() => props.dirty ?? dirtyState.value)

function setDirty(value: boolean) {
  if (props.dirty !== undefined)
    return
  if (value)
    markedDirtyRef.value = true
  dirtyState.value = value
}

function setTouched(value: boolean) {
  if (props.touched !== undefined)
    return
  touchedState.value = value
}

function setFilled(value: boolean) {
  filled.value = value
}

function setFocused(value: boolean) {
  focused.value = value
}

const { errors: formErrors } = useFormContext()

const hasFormError = computed(() => {
  const n = props.name
  return !!n && Object.hasOwn(formErrors.value, n) && formErrors.value[n] !== undefined
})
const invalid = computed(() => props.invalid === true || hasFormError.value)

const validityData = ref<FieldValidityData>({
  state: { ...DEFAULT_VALIDITY_STATE },
  error: '',
  errors: [],
  value: null,
  initialValue: null,
})

function setValidityData(data: FieldValidityData) {
  validityData.value = data
}

const valid = computed(() => !invalid.value && validityData.value.state.valid)

function shouldValidateOnChange() {
  return validationModeRef.value === 'onChange'
    || (validationModeRef.value === 'onSubmit' && submitAttempted.value)
}

const state = computed<FieldRootState>(() => ({
  disabled: disabled.value,
  touched: touched.value,
  dirty: dirty.value,
  valid: valid.value,
  filled: filled.value,
  focused: focused.value,
}))

const validation = useFieldValidation({
  controlId,
  getDescriptionProps,
  setValidityData,
  validate: (value, formValues) => validateFn.value(value, formValues),
  validityData,
  validationDebounceTime: validationDebounceTimeRef,
  invalid,
  markedDirtyRef,
  state,
  name: nameRef,
  shouldValidateOnChange,
})

const contextValue: FieldRootContext = {
  get invalid() { return invalid.value },
  name: nameRef,
  validityData,
  setValidityData,
  disabled,
  touched,
  setTouched,
  dirty,
  setDirty,
  filled,
  setFilled,
  focused,
  setFocused,
  validate: (value, formValues) => validateFn.value(value, formValues),
  validationMode: validationModeRef,
  validationDebounceTime: validationDebounceTimeRef,
  shouldValidateOnChange,
  state,
  markedDirtyRef,
  validation,
}

provide(fieldRootContextKey, contextValue)

function handleImperativeValidate() {
  markedDirtyRef.value = true
  const currentValue = validation.inputRef.value?.value ?? validityData.value.value
  void validation.commit(currentValue)
}

defineExpose<FieldRootExpose>({
  validate: handleImperativeValidate,
})

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(state.value, fieldValidityMapping)
  return {
    ...attrs,
    class: typeof props.class === 'function' ? props.class(state.value) : props.class,
    style: typeof props.style === 'function' ? props.style(state.value) : props.style,
    ...stateAttributes,
  }
})
</script>

<template>
  <component :is="props.as" v-bind="mergedProps">
    <slot />
  </component>
</template>
