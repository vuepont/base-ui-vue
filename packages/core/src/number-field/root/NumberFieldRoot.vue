<script setup lang="ts">
import type { FieldRootState } from '../../field/root/FieldRoot.vue'
import type { BaseUIComponentProps } from '../../utils/types'
import type {
  Direction,
  EventWithOptionalKeyState,
  IncrementValueParameters,
} from '../utils/types'
import type {
  InputMode,
  NumberFieldRootChangeEventDetails,
  NumberFieldRootChangeEventReason,
  NumberFieldRootCommitEventDetails,
} from './NumberFieldRootContext'
import { computed, provide, ref, useAttrs, watch, watchEffect } from 'vue'
import { useFieldRootContext } from '../../field/root/FieldRootContext'
import { useField } from '../../field/useField'
import { activeElement } from '../../floating-ui-vue/utils'
import { useFormContext } from '../../form/FormContext'
import { useLabelableId } from '../../labelable-provider/useLabelableId'
import { createChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import { isIOS } from '../../utils/detectBrowser'
import { formatNumber, formatNumberMaxPrecision } from '../../utils/formatNumber'
import { ownerDocument } from '../../utils/owner'
import { REASONS } from '../../utils/reasons'
import { useControllableState } from '../../utils/useControllableState'
import { useRenderElement } from '../../utils/useRenderElement'
import { visuallyHidden, visuallyHiddenInput } from '../../utils/visuallyHidden'
import { DEFAULT_STEP } from '../utils/constants'
import {
  BASE_NON_NUMERIC_SYMBOLS,
  getNumberLocaleDetails,
  MINUS_SIGNS_WITH_ASCII,
  PERCENTAGES,
  PERMILLE,
  PLUS_SIGNS_WITH_ASCII,
  SPACE_SEPARATOR_RE,
} from '../utils/parse'
import { stateAttributesMapping } from '../utils/stateAttributesMapping'
import { hasNumberFormatRoundingOptions, toValidatedNumber } from '../utils/validate'
import { numberFieldRootContextKey } from './NumberFieldRootContext'

export interface NumberFieldRootState extends FieldRootState {
  /**
   * The raw numeric value of the field.
   */
  value: number | null
  /**
   * The formatted string value presented in the input element.
   */
  inputValue: string
  /**
   * Whether the user must enter a value before submitting a form.
   */
  required: boolean
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean
  /**
   * Whether the user should be unable to change the field value.
   */
  readOnly: boolean
  /**
   * Whether the user is currently scrubbing the field.
   */
  scrubbing: boolean
}

export interface NumberFieldRootProps extends BaseUIComponentProps<NumberFieldRootState> {
  /**
   * The id of the input element.
   */
  id?: string
  /**
   * The minimum value of the input element.
   */
  min?: number
  /**
   * The maximum value of the input element.
   */
  max?: number
  /**
   * When true, direct text entry may be outside the `min`/`max` range without clamping,
   * so native range underflow/overflow validation can occur.
   * Step-based interactions (keyboard arrows, buttons, wheel, scrub) still clamp.
   * @default false
   */
  allowOutOfRange?: boolean
  /**
   * The small step value of the input element when incrementing while the alt key is held. Snaps
   * to multiples of this value.
   * @default 0.1
   */
  smallStep?: number
  /**
   * Amount to increment and decrement with the buttons and arrow keys, or to scrub with pointer
   * movement in the scrub area.
   * Specify `step="any"` to always disable step validation.
   * @default 1
   */
  step?: number | 'any'
  /**
   * The large step value of the input element when incrementing while the shift key is held. Snaps
   * to multiples of this value.
   * @default 10
   */
  largeStep?: number
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
   * Identifies the form that owns the hidden input.
   * Useful when the number field is rendered outside the form.
   */
  form?: string
  /**
   * The raw numeric value of the field.
   */
  value?: number | null
  /**
   * The uncontrolled value of the field when it's initially rendered.
   *
   * To render a controlled number field, use the `value` prop instead.
   */
  defaultValue?: number
  /**
   * Whether to allow the user to scrub the input value with the mouse wheel while focused and
   * hovering over the input.
   * @default false
   */
  allowWheelScrub?: boolean
  /**
   * Whether the value should snap to the nearest step when incrementing or decrementing.
   * @default false
   */
  snapOnStep?: boolean
  /**
   * Options to format the input value.
   */
  format?: Intl.NumberFormatOptions
  /**
   * The locale of the input element.
   * Defaults to the user's runtime locale.
   */
  locale?: Intl.LocalesArgument
}

defineOptions({
  name: 'NumberFieldRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<NumberFieldRootProps>(), {
  as: 'div',
  smallStep: 0.1,
  step: 1,
  largeStep: 10,
  required: false,
  disabled: false,
  readOnly: false,
  allowWheelScrub: false,
  snapOnStep: false,
  allowOutOfRange: false,
})

const emit = defineEmits<{
  /**
   * Fired when the number value changes.
   */
  valueChange: [value: number | null, eventDetails: NumberFieldRootChangeEventDetails]
  /**
   * Fired when the value is committed (input blur, pointer release, or keyboard interaction).
   */
  valueCommitted: [value: number | null, eventDetails: NumberFieldRootCommitEventDetails]
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
} = useFieldRootContext()
const { clearErrors } = useFormContext()

const disabled = computed(() => fieldDisabled.value || props.disabled)
const readOnly = computed(() => props.readOnly)
const required = computed(() => props.required)
const nameProp = computed(() => props.name)
const name = computed(() => fieldName.value ?? props.name)
const step = computed(() => (props.step === 'any' ? 1 : props.step))
const smallStep = computed(() => props.smallStep)
const largeStep = computed(() => props.largeStep)
const locale = computed(() => props.locale)
const format = computed(() => props.format)
const min = computed(() => props.min)
const max = computed(() => props.max)

const minWithDefault = computed(() => props.min ?? Number.MIN_SAFE_INTEGER)
const maxWithDefault = computed(() => props.max ?? Number.MAX_SAFE_INTEGER)
const minWithZeroDefault = computed(() => props.min ?? 0)
const formatStyle = computed(() => props.format?.style)

const isScrubbingRef = ref(false)
function setIsScrubbing(value: boolean) {
  isScrubbingRef.value = value
}

const inputRef = ref<HTMLInputElement | null>(null)
const validationInputRef = ref<HTMLInputElement | null>(null)

const id = useLabelableId({ id: computed(() => props.id) })

const { value: valueUnwrapped, setValue: setValueUnwrapped } = useControllableState<number | null>({
  controlled: () => props.value,
  default: () => props.defaultValue ?? null,
  name: 'NumberField',
  state: 'value',
})

const value = computed(() => valueUnwrapped.value ?? null)

const valueRef = ref<number | null>(value.value)
watch(value, (next) => {
  valueRef.value = next
}, { flush: 'post' })

const formatOptionsRef = format

const hasPendingCommitRef = ref(false)
const allowInputSyncRef = ref(true)
const lastChangedValueRef = ref<number | null>(null)

function onValueCommitted(
  nextValue: number | null,
  eventDetails: NumberFieldRootCommitEventDetails,
) {
  hasPendingCommitRef.value = false
  emit('valueCommitted', nextValue, eventDetails)
}

function getControlledInputValue(nextValue: number | null) {
  return hasNumberFormatRoundingOptions(format.value)
    ? formatNumber(nextValue, locale.value, format.value)
    : formatNumberMaxPrecision(nextValue, locale.value, format.value)
}

const inputValue = ref<string>(
  props.value !== undefined
    ? getControlledInputValue(value.value)
    : formatNumber(value.value, locale.value, format.value),
)
function setInputValue(next: string) {
  inputValue.value = next
}

const inputMode = ref<InputMode>('numeric')

watchEffect(() => {
  setFilled(value.value !== null)
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
  controlRef: inputRef,
})

function getAllowedNonNumericKeys() {
  const { decimal, group, currency, literal } = getNumberLocaleDetails(locale.value, format.value)

  const keys = new Set<string | undefined>()
  BASE_NON_NUMERIC_SYMBOLS.forEach(symbol => keys.add(symbol))
  if (decimal) {
    keys.add(decimal)
  }
  if (group) {
    keys.add(group)
    if (SPACE_SEPARATOR_RE.test(group)) {
      keys.add(' ')
    }
  }

  const allowPercentSymbols
    = formatStyle.value === 'percent'
      || (formatStyle.value === 'unit' && format.value?.unit === 'percent')
  const allowPermilleSymbols
    = formatStyle.value === 'percent'
      || (formatStyle.value === 'unit' && format.value?.unit === 'permille')

  if (allowPercentSymbols) {
    PERCENTAGES.forEach(key => keys.add(key))
  }
  if (allowPermilleSymbols) {
    PERMILLE.forEach(key => keys.add(key))
  }

  if (formatStyle.value === 'currency' && currency) {
    keys.add(currency)
  }

  if (literal) {
    // Some locales (e.g. de-DE) insert a literal space character between the number
    // and the symbol, so allow those characters to be typed/removed.
    Array.from(literal).forEach(char => keys.add(char))
    if (SPACE_SEPARATOR_RE.test(literal)) {
      keys.add(' ')
    }
  }

  // Allow plus sign in all cases; minus sign only when negatives are valid
  PLUS_SIGNS_WITH_ASCII.forEach(key => keys.add(key))
  if (minWithDefault.value < 0) {
    MINUS_SIGNS_WITH_ASCII.forEach(key => keys.add(key))
  }

  return keys
}

function getStepAmount(event?: EventWithOptionalKeyState) {
  if (event?.altKey) {
    return smallStep.value
  }
  if (event?.shiftKey) {
    return largeStep.value
  }
  return step.value
}

function setValue(unvalidatedValue: number | null, details: NumberFieldRootChangeEventDetails): boolean {
  const eventWithOptionalKeyState = details.event as EventWithOptionalKeyState
  const dir = details.direction
  const reason = details.reason
  // Only allow out-of-range values for direct text entry (native-like behavior).
  // Step-based interactions (keyboard arrows, buttons, wheel, scrub) still clamp to min/max.
  const shouldClampValue
    = !props.allowOutOfRange
      || !(
        reason === REASONS.inputChange
        || reason === REASONS.inputBlur
        || reason === REASONS.inputPaste
        || reason === REASONS.inputClear
        || reason === REASONS.none
      )

  const validatedValue = toValidatedNumber(unvalidatedValue, {
    step: dir ? getStepAmount(eventWithOptionalKeyState) * dir : undefined,
    format: formatOptionsRef.value,
    minWithDefault: minWithDefault.value,
    maxWithDefault: maxWithDefault.value,
    minWithZeroDefault: minWithZeroDefault.value,
    snapOnStep: props.snapOnStep,
    small: eventWithOptionalKeyState?.altKey ?? false,
    clamp: shouldClampValue,
  })

  // Determine whether we should notify about a change even if the numeric value is unchanged.
  const isInputReason
    = details.reason === REASONS.inputChange
      || details.reason === REASONS.inputClear
      || details.reason === REASONS.inputBlur
      || details.reason === REASONS.inputPaste
      || details.reason === REASONS.none
  const shouldFireChange
    = validatedValue !== value.value
      || (isInputReason && (unvalidatedValue !== value.value || allowInputSyncRef.value === false))

  if (shouldFireChange) {
    emit('valueChange', validatedValue, details)

    if (details.isCanceled) {
      return shouldFireChange
    }

    setValueUnwrapped(validatedValue)
    setDirty(validatedValue !== validityData.value.initialValue)
    hasPendingCommitRef.value = true
  }

  lastChangedValueRef.value = validatedValue

  // Keep the visible input in sync immediately when programmatic changes occur.
  if (allowInputSyncRef.value) {
    setInputValue(formatNumber(validatedValue, locale.value, format.value))
  }

  return shouldFireChange
}

function incrementValue(
  amount: number,
  { direction, currentValue, event, reason }: IncrementValueParameters,
): boolean {
  const prevValue = currentValue == null ? valueRef.value : currentValue
  const nextValue
    = typeof prevValue === 'number' ? prevValue + amount * direction : Math.max(0, props.min ?? 0)
  return setValue(
    nextValue,
    createChangeEventDetails<NumberFieldRootChangeEventReason, { direction?: Direction }>(
      reason,
      event as any,
      undefined,
      { direction },
    ),
  )
}

// Sync the formatted input value when the parsed value or formatting changes.
watch(
  [value, locale, format],
  () => {
    if (!allowInputSyncRef.value) {
      return
    }

    const nextInputValue
      = props.value !== undefined
        ? getControlledInputValue(value.value)
        : formatNumber(value.value, locale.value, format.value)

    if (nextInputValue !== inputValue.value) {
      setInputValue(nextInputValue)
    }
  },
  { flush: 'post' },
)

// iOS numeric software keyboard doesn't have a minus key, so we need to use the default
// keyboard to let the user input a negative number.
watchEffect(() => {
  if (!isIOS) {
    return
  }

  let computedInputMode: InputMode = 'text'

  if (minWithDefault.value >= 0) {
    // iOS numeric software keyboard doesn't have a decimal key for "numeric" input mode, but
    // this is better than the "text" input if possible to use.
    computedInputMode = 'decimal'
  }

  inputMode.value = computedInputMode
})

// The `onWheel` prop can't be prevented, so we need to use a global event listener.
watchEffect((onCleanup) => {
  const element = inputRef.value
  if (disabled.value || readOnly.value || !props.allowWheelScrub || !element) {
    return
  }

  function handleWheel(event: WheelEvent) {
    if (
      // Allow pinch-zooming.
      event.ctrlKey
      || activeElement(ownerDocument(inputRef.value)!) !== inputRef.value
    ) {
      return
    }

    // Prevent the default behavior to avoid scrolling the page.
    event.preventDefault()
    allowInputSyncRef.value = true

    const amount = getStepAmount(event) ?? DEFAULT_STEP

    incrementValue(amount, {
      direction: event.deltaY > 0 ? -1 : 1,
      event,
      reason: 'wheel',
    })
  }

  element.addEventListener('wheel', handleWheel, { passive: false })
  onCleanup(() => {
    element.removeEventListener('wheel', handleWheel)
  })
})

const state = computed<NumberFieldRootState>(() => ({
  ...fieldState.value,
  disabled: disabled.value,
  readOnly: readOnly.value,
  required: required.value,
  value: value.value,
  inputValue: inputValue.value,
  scrubbing: isScrubbingRef.value,
}))

provide(numberFieldRootContextKey, {
  inputRef,
  inputValue,
  value,
  minWithDefault,
  maxWithDefault,
  disabled,
  readOnly,
  id,
  setValue,
  incrementValue,
  getStepAmount,
  allowInputSyncRef,
  formatOptionsRef,
  valueRef,
  lastChangedValueRef,
  hasPendingCommitRef,
  name,
  nameProp,
  required,
  invalid,
  inputMode,
  getAllowedNonNumericKeys,
  min,
  max,
  setInputValue,
  locale,
  isScrubbing: isScrubbingRef,
  setIsScrubbing,
  state,
  onValueCommitted,
})

const rootRef = ref<HTMLElement | null>(null)

const {
  tag: rootTag,
  mergedProps: rootMergedProps,
  renderless: rootRenderless,
  ref: rootRenderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: attrsObject,
  stateAttributesMapping,
  defaultTagName: 'div',
  ref: rootRef,
})

const hiddenInputProps = computed<Record<string, any>>(() => ({
  ...validation.getValidationProps(),
  'type': 'number',
  'form': props.form,
  'name': name.value,
  'value': value.value ?? '',
  'min': props.min,
  'max': props.max,
  'step': props.step,
  'disabled': disabled.value,
  'required': required.value,
  'aria-hidden': true,
  'tabindex': -1,
  'style': name.value ? visuallyHiddenInput : visuallyHidden,
}))

function handleHiddenFocus() {
  inputRef.value?.focus()
}

function handleHiddenInput(event: Event) {
  const target = event.currentTarget as HTMLInputElement
  if (event.defaultPrevented || disabled.value || readOnly.value) {
    return
  }

  // Handle browser autofill.
  const nextValue = target.valueAsNumber
  const parsedValue = Number.isNaN(nextValue) ? null : nextValue
  const details = createChangeEventDetails(REASONS.none, event)

  setDirty(parsedValue !== validityData.value.initialValue)
  setValue(parsedValue, details)
  clearErrors(name.value)
  void validation.commit(parsedValue, true)
}
</script>

<template>
  <component :is="rootTag" v-if="!rootRenderless" :ref="rootRenderRef" v-bind="rootMergedProps">
    <slot :state="state" />
  </component>
  <slot v-else :ref="rootRenderRef" :props="rootMergedProps" :state="state" />
  <input
    ref="validationInputRef"
    v-bind="hiddenInputProps"
    suppresshydrationwarning
    @input="handleHiddenInput"
    @focus="handleHiddenFocus"
  >
</template>
