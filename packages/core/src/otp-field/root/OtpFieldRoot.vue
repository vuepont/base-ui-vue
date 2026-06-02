<script setup lang="ts">
import type { FieldRootState } from '../../field/root/FieldRoot.vue'
import type { BaseUIComponentProps } from '../../utils/types'
import type { OtpValidationType } from '../utils/otp'
import type {
  OtpFieldRootChangeEventDetails,
  OtpFieldRootCompleteEventDetails,
  OtpFieldRootInvalidEventDetails,
} from './OtpFieldRootContext'
import { computed, provide, ref, useAttrs, watchEffect } from 'vue'
import CompositeList from '../../composite/list/CompositeList.vue'
import { useFieldRootContext } from '../../field/root/FieldRootContext'
import { useField } from '../../field/useField'
import { contains } from '../../floating-ui-vue/utils'
import { useFormContext } from '../../form/FormContext'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { useAriaLabelledBy } from '../../labelable-provider/useAriaLabelledBy'
import { useLabelableId } from '../../labelable-provider/useLabelableId'
import { mergeProps } from '../../merge-props/mergeProps'
import { createChangeEventDetails, createGenericEventDetails } from '../../utils/createBaseUIEventDetails'
import { ownerDocument } from '../../utils/owner'
import { REASONS } from '../../utils/reasons'
import { useControllableState } from '../../utils/useControllableState'
import { useRenderElement } from '../../utils/useRenderElement'
import { useValueChanged } from '../../utils/useValueChanged'
import { visuallyHidden, visuallyHiddenInput } from '../../utils/visuallyHidden'
import { warn } from '../../utils/warn'
import { getOTPValidationConfig, normalizeOTPValue, normalizeOTPValueWithDetails } from '../utils/otp'
import { rootStateAttributesMapping } from '../utils/stateAttributesMapping'
import { otpFieldRootContextKey } from './OtpFieldRootContext'

export interface OtpFieldRootState extends FieldRootState {
  /**
   * Whether all slots are filled.
   */
  complete: boolean
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean
  /**
   * The number of OTP input slots.
   */
  length: number
  /**
   * Whether the user should be unable to change the field value.
   */
  readOnly: boolean
  /**
   * Whether the user must enter a value before submitting a form.
   */
  required: boolean
  /**
   * The OTP value.
   */
  value: string
}

export interface OtpFieldRootProps extends BaseUIComponentProps<OtpFieldRootState> {
  /**
   * The id of the first input element.
   * Subsequent inputs derive their ids from it (`{id}-2`, `{id}-3`, and so on).
   */
  id?: string
  /**
   * The input autocomplete attribute. Applied to the first slot and hidden validation input.
   * @default 'one-time-code'
   */
  autoComplete?: string
  /**
   * A string specifying the `form` element with which the hidden input is associated.
   * This string's value must match the id of a `form` element in the same document.
   */
  form?: string
  /**
   * The number of OTP input slots.
   * Required so the root can clamp values, detect completion, and generate
   * consistent validation markup before all slots hydrate.
   */
  length: number
  /**
   * Whether to submit the owning form when the OTP becomes complete.
   * @default false
   */
  autoSubmit?: boolean
  /**
   * Whether the slot inputs should mask entered characters.
   * Pass `type` directly to individual `OtpFieldInput` parts to use a custom input type.
   * @default false
   */
  mask?: boolean
  /**
   * The virtual keyboard hint applied to the slot inputs and hidden validation input.
   */
  inputMode?: string
  /**
   * The type of input validation to apply to the OTP value.
   * @default 'numeric'
   */
  validationType?: OtpValidationType
  /**
   * Function that normalizes the OTP value after whitespace and `validationType` filtering.
   * It should be idempotent because OtpField may normalize the same value more than once.
   */
  normalizeValue?: (value: string) => string
  /**
   * Whether the user must enter a value before submitting a form.
   * @default false
   */
  required?: boolean
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean
  /**
   * Whether the user should be unable to change the field value.
   * @default false
   */
  readOnly?: boolean
  /**
   * Identifies the field when a form is submitted.
   */
  name?: string
  /**
   * The OTP value.
   */
  value?: string
  /**
   * The uncontrolled OTP value when the component is initially rendered.
   */
  defaultValue?: string
}

defineOptions({
  name: 'OtpFieldRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<OtpFieldRootProps>(), {
  as: 'div',
  autoComplete: 'one-time-code',
  autoSubmit: false,
  mask: false,
  validationType: 'numeric',
  required: false,
  disabled: false,
  readOnly: false,
})

const emit = defineEmits<{
  /**
   * Fired when the OTP value changes.
   */
  valueChange: [value: string, eventDetails: OtpFieldRootChangeEventDetails]
  /**
   * Fired when entered text contains characters rejected by validation or normalization.
   */
  valueInvalid: [value: string, eventDetails: OtpFieldRootInvalidEventDetails]
  /**
   * Fired when the OTP value becomes complete.
   */
  valueComplete: [value: string, eventDetails: OtpFieldRootCompleteEventDetails]
}>()

const attrs = useAttrs()
const attrsObject = attrs as Record<string, any>

const {
  setDirty,
  validityData,
  disabled: fieldDisabled,
  setFilled,
  invalid,
  name: fieldName,
  state: fieldState,
  validation,
  validationMode,
  setFocused,
  setTouched,
} = useFieldRootContext()
const { clearErrors } = useFormContext()
const { getDescriptionProps, labelId } = useLabelableContext()

const length = computed(() => props.length)
const validationType = computed(() => props.validationType)
const normalizeValueProp = computed(() => props.normalizeValue)
const disabled = computed(() => fieldDisabled.value || props.disabled)
const readOnly = computed(() => props.readOnly)
const required = computed(() => props.required)
const mask = computed(() => props.mask)
const autoComplete = computed(() => props.autoComplete)
const formProp = computed(() => props.form)

const name = computed(() => fieldName.value ?? props.name)

const { value: valueUnwrapped, setValue: setValueUnwrapped } = useControllableState<string>({
  controlled: () => props.value,
  default: () => props.defaultValue ?? '',
  name: 'OtpField',
  state: 'value',
})

const value = computed(() =>
  normalizeOTPValue(valueUnwrapped.value, length.value, validationType.value, normalizeValueProp.value),
)
const filled = computed(() => value.value !== '')

const rootRef = ref<HTMLElement | null>(null)
// Wrap in a plain object so the template binding passes the Ref itself instead of
// the auto-unwrapped array (CompositeList needs the live Ref).
const inputRefsHolder = { elementsRef: ref<Array<HTMLElement | null>>([]) }
const inputRefs = inputRefsHolder.elementsRef
const validationInputRef = ref<HTMLInputElement | null>(null)
const firstInputRef = {
  get value() {
    return inputRefs.value[0] ?? null
  },
}

let pendingFocus: { index: number, value: string } | null = null
let pendingCompleteValue: { value: string, eventDetails: OtpFieldRootCompleteEventDetails } | null = null

const inputCount = ref(0)
const focusedIndex = ref(Math.min(value.value.length, length.value - 1))
const focused = ref(false)

const id = useLabelableId({ id: computed(() => props.id) })

const ariaLabelledByAttr = computed(() => attrs['aria-labelledby'] as string | undefined)
const ariaLabelledBy = useAriaLabelledBy({
  ariaLabelledBy: ariaLabelledByAttr,
  labelId,
  labelSourceRef: firstInputRef,
  enableFallback: true,
  labelSourceId: () => id.value ?? undefined,
})
const inputAriaLabelledBy = computed(() =>
  ariaLabelledByAttr.value == null ? ariaLabelledBy.value : undefined,
)

const ariaDescribedBy = computed(() =>
  mergeAriaIds(
    attrs['aria-describedby'] as string | undefined,
    getDescriptionProps()['aria-describedby'],
  ),
)

const validationConfig = computed(() => getOTPValidationConfig(validationType.value))
const pattern = computed(() => validationConfig.value?.slotPattern)
const hiddenInputPattern = computed(() => validationConfig.value?.getRootPattern(length.value))
const inputMode = computed(() => props.inputMode ?? validationConfig.value?.inputMode)
const hasValidLength = computed(() => Number.isInteger(length.value) && length.value > 0)

const activeIndex = computed(() =>
  focused.value
    ? Math.min(focusedIndex.value, Math.max(length.value - 1, 0))
    : Math.min(value.value.length, length.value - 1),
)

watchEffect(() => {
  setFilled(filled.value)
})

watchEffect(() => {
  validation.setInputRef(validationInputRef.value)
})

useField({
  enabled: computed(() => !disabled.value),
  id,
  name,
  commit: (v: unknown) => validation.commit(v),
  value,
  getValue: () => value.value,
  controlRef: firstInputRef,
})

function focusInput(index: number) {
  const targetIndex = Math.min(Math.max(index, 0), Math.max(inputRefs.value.length - 1, 0))
  const target = inputRefs.value[targetIndex] as HTMLInputElement | null
  target?.focus()
  target?.select()
}

function queueFocusInput(index: number, nextValue: string) {
  pendingFocus = { index, value: nextValue }
}

function requestSubmit() {
  let formElement: HTMLFormElement | null
    = validationInputRef.value?.form
      ?? (inputRefs.value[0] as HTMLInputElement | null)?.form
      ?? null

  if (formProp.value) {
    const associatedElement = ownerDocument(rootRef.value)?.getElementById(formProp.value)
    if (associatedElement?.tagName === 'FORM') {
      formElement = associatedElement as HTMLFormElement
    }
  }

  if (formElement && typeof formElement.requestSubmit === 'function') {
    formElement.requestSubmit()
  }
}

function completeValue(completedValue: string, eventDetails: OtpFieldRootCompleteEventDetails) {
  emit('valueComplete', completedValue, eventDetails)

  if (props.autoSubmit) {
    requestSubmit()
  }
}

function getCompleteEventDetails(details: OtpFieldRootChangeEventDetails) {
  if (details.reason === REASONS.inputChange || details.reason === REASONS.inputPaste) {
    return createGenericEventDetails(details.reason, details.event) as OtpFieldRootCompleteEventDetails
  }

  return null
}

function setValue(nextValue: string, details: OtpFieldRootChangeEventDetails): string | null {
  const currentValue = value.value
  const normalizedValue = normalizeOTPValue(
    nextValue,
    length.value,
    validationType.value,
    normalizeValueProp.value,
  )
  const completeEventDetails
    = normalizedValue.length === length.value
      && (currentValue.length !== length.value || details.reason === REASONS.inputPaste)
      ? getCompleteEventDetails(details)
      : null

  if (normalizedValue === currentValue) {
    if (completeEventDetails != null) {
      completeValue(normalizedValue, completeEventDetails)
    }

    return null
  }

  emit('valueChange', normalizedValue, details)

  if (details.isCanceled) {
    return null
  }

  setValueUnwrapped(normalizedValue)

  if (completeEventDetails != null) {
    pendingCompleteValue = { value: normalizedValue, eventDetails: completeEventDetails }
  }
  else if (normalizedValue.length !== length.value) {
    pendingCompleteValue = null
  }

  return normalizedValue
}

function reportValueInvalid(invalidValue: string, details: OtpFieldRootInvalidEventDetails) {
  emit('valueInvalid', invalidValue, details)
}

function handleInputFocus(index: number, event: FocusEvent) {
  if (index > value.value.length) {
    focusInput(Math.min(value.value.length, length.value - 1))
    return
  }

  focusedIndex.value = index
  focused.value = true
  setFocused(true)
  ;(event.currentTarget as HTMLInputElement).select()
}

function handleInputBlur(event: FocusEvent) {
  if (contains(rootRef.value, event.relatedTarget as Element | null)) {
    return
  }

  setTouched(true)
  focused.value = false
  setFocused(false)

  if (validationMode.value === 'onBlur') {
    validation.commit(value.value)
  }
}

function getInputId(index: number) {
  if (id.value == null) {
    return undefined
  }

  return index === 0 ? id.value : `${id.value}-${index + 1}`
}

useValueChanged(value, () => {
  clearErrors(name.value)
  setDirty(value.value !== validityData.value.initialValue)

  void validation.commit(value.value, true)

  if (pendingCompleteValue != null) {
    const pending = pendingCompleteValue
    pendingCompleteValue = null

    if (pending.value === value.value) {
      completeValue(value.value, pending.eventDetails)
    }
  }

  if (pendingFocus != null) {
    const pending = pendingFocus
    pendingFocus = null

    if (pending.value === value.value) {
      focusInput(pending.index)
    }
  }
})

const state = computed<OtpFieldRootState>(() => ({
  ...fieldState.value,
  complete: value.value.length === length.value,
  disabled: disabled.value,
  filled: filled.value,
  focused: focused.value,
  length: length.value,
  readOnly: readOnly.value,
  required: required.value,
  value: value.value,
}))

provide(otpFieldRootContextKey, {
  activeIndex,
  autoComplete,
  disabled,
  form: formProp,
  focusInput,
  queueFocusInput,
  getInputId,
  handleInputBlur,
  handleInputFocus,
  inputMode,
  inputAriaLabelledBy,
  invalid,
  length,
  mask,
  pattern,
  reportValueInvalid,
  readOnly,
  required,
  normalizeValue: normalizeValueProp,
  setValue,
  state,
  validationType,
  value,
})

const rootProps = computed(() => mergeProps(
  attrsObject,
  {
    'role': 'group',
    'aria-describedby': ariaDescribedBy.value,
    'aria-labelledby': ariaLabelledBy.value,
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
  props: rootProps,
  stateAttributesMapping: rootStateAttributesMapping,
  defaultTagName: 'div',
  ref: rootRef,
})

const hiddenInputProps = computed<Record<string, any>>(() => ({
  ...validation.getValidationProps(),
  'type': 'text',
  'id': id.value && name.value == null ? `${id.value}-hidden-input` : undefined,
  'form': formProp.value,
  'name': name.value,
  'value': value.value,
  'autocomplete': autoComplete.value,
  'inputmode': inputMode.value,
  'minlength': length.value,
  'maxlength': length.value,
  'pattern': hiddenInputPattern.value,
  'disabled': disabled.value,
  'readonly': readOnly.value,
  'required': required.value,
  'aria-hidden': true,
  'tabindex': -1,
  'style': name.value ? visuallyHiddenInput : visuallyHidden,
}))

function handleHiddenFocus() {
  focusInput(0)
}

function handleHiddenInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (event.defaultPrevented || disabled.value || readOnly.value) {
    return
  }

  const rawValue = target.value
  const [normalizedValue, didRejectCharacters] = normalizeOTPValueWithDetails(
    rawValue,
    length.value,
    validationType.value,
    normalizeValueProp.value,
  )

  if (didRejectCharacters) {
    reportValueInvalid(rawValue, createGenericEventDetails(REASONS.inputChange, event))
  }

  const committedValue = setValue(
    normalizedValue,
    createChangeEventDetails(REASONS.inputChange, event),
  )

  if (committedValue != null && committedValue !== '') {
    queueFocusInput(committedValue.length - 1, committedValue)
  }
}

function mergeAriaIds(...values: Array<string | undefined>) {
  const ids = values.flatMap(v => v?.split(/\s+/).filter(Boolean) ?? [])
  return ids.length > 0 ? Array.from(new Set(ids)).join(' ') : undefined
}

if (process.env.NODE_ENV !== 'production') {
  watchEffect(() => {
    const len = length.value
    if (!Number.isInteger(len) || len <= 0) {
      warn(`<OtpFieldRoot> \`length\` must be a positive integer. Received \`length={${String(len)}}\`.`)
      return
    }

    if (inputCount.value !== 0 && inputCount.value !== len) {
      warn(
        `<OtpFieldRoot> \`length\` must match the number of rendered <OtpFieldInput /> parts. `
        + `Received \`length={${len}}\` but rendered ${inputCount.value} input${inputCount.value === 1 ? '' : 's'}.`,
      )
    }
  })
}

function handleMapChange(map: Map<Element, unknown>) {
  inputCount.value = map.size
}
</script>

<template>
  <CompositeList :elements-ref="inputRefsHolder.elementsRef" :on-map-change="handleMapChange">
    <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
    <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
      <slot :state="state" />
    </component>
    <input
      v-if="hasValidLength"
      ref="validationInputRef"
      v-bind="hiddenInputProps"
      @input="handleHiddenInput"
      @focus="handleHiddenFocus"
    >
  </CompositeList>
</template>
