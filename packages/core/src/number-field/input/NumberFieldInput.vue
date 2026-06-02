<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { BaseUIComponentProps } from '../../utils/types'
import type { NumberFieldRootState } from '../root/NumberFieldRoot.vue'
import { computed, useAttrs } from 'vue'
import { useFieldRootContext } from '../../field/root/FieldRootContext'
import { stopEvent } from '../../floating-ui-vue/utils'
import { useFormContext } from '../../form/FormContext'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { mergeProps } from '../../merge-props/mergeProps'
import {
  createChangeEventDetails,
  createGenericEventDetails,
} from '../../utils/createBaseUIEventDetails'
import { formatNumber, formatNumberMaxPrecision } from '../../utils/formatNumber'
import { REASONS } from '../../utils/reasons'
import { useRenderElement } from '../../utils/useRenderElement'
import { useValueChanged } from '../../utils/useValueChanged'
import { warn } from '../../utils/warn'
import { useNumberFieldRootContext } from '../root/NumberFieldRootContext'
import { DEFAULT_STEP } from '../utils/constants'
import {
  ANY_MINUS_DETECT_RE,
  ANY_MINUS_RE,
  ANY_PLUS_DETECT_RE,
  ANY_PLUS_RE,
  ARABIC_DETECT_RE,
  FULLWIDTH_DETECT_RE,
  getNumberLocaleDetails,
  HAN_DETECT_RE,
  parseNumber,
  PERSIAN_DETECT_RE,
} from '../utils/parse'
import { stateAttributesMapping } from '../utils/stateAttributesMapping'
import { hasNumberFormatRoundingOptions, removeFloatingPointErrors } from '../utils/validate'

export type NumberFieldInputState = NumberFieldRootState

export interface NumberFieldInputProps extends BaseUIComponentProps<NumberFieldInputState> {}

defineOptions({
  name: 'NumberFieldInput',
  inheritAttrs: false,
})

const props = defineProps<NumberFieldInputProps>()

const attrs = useAttrs()
const attrsObject = attrs as Record<string, any>

const NAVIGATE_KEYS = new Set([
  'Backspace',
  'Delete',
  'ArrowLeft',
  'ArrowRight',
  'Tab',
  'Enter',
  'Escape',
])

const {
  allowInputSyncRef,
  disabled,
  formatOptionsRef,
  getAllowedNonNumericKeys,
  getStepAmount,
  id,
  incrementValue,
  inputMode,
  inputValue,
  max,
  min,
  name,
  readOnly,
  required,
  setValue,
  state,
  setInputValue,
  locale,
  inputRef,
  value,
  onValueCommitted,
  lastChangedValueRef,
  hasPendingCommitRef,
  valueRef,
} = useNumberFieldRootContext()

const { clearErrors } = useFormContext()
const {
  validationMode,
  setTouched,
  setFocused,
  invalid,
  shouldValidateOnChange,
  validation,
} = useFieldRootContext()
const { labelId } = useLabelableContext()

let hasTouchedInput = false
let blockRevalidation = false

function setInputRef(el: Element | ComponentPublicInstance | null) {
  inputRef.value = el as HTMLInputElement | null
}

useValueChanged(value, () => {
  clearErrors(name.value)

  if (blockRevalidation && !shouldValidateOnChange()) {
    blockRevalidation = false
    return
  }

  void validation.commit(value.value, true)
})

function onFocus(event: FocusEvent) {
  if (event.defaultPrevented || readOnly.value || disabled.value) {
    return
  }

  setFocused(true)

  if (hasTouchedInput) {
    return
  }

  hasTouchedInput = true

  // Browsers set selection at the start of the input field by default. We want to set it at
  // the end for the first focus.
  const target = event.currentTarget as HTMLInputElement
  const length = target.value.length
  target.setSelectionRange(length, length)
}

function onBlur(event: FocusEvent) {
  if (event.defaultPrevented || readOnly.value || disabled.value) {
    return
  }

  setTouched(true)
  setFocused(false)

  const hadManualInput = !allowInputSyncRef.value
  const hadPendingProgrammaticChange = hasPendingCommitRef.value

  allowInputSyncRef.value = true

  if (inputValue.value.trim() === '') {
    setValue(null, createChangeEventDetails(REASONS.inputClear, event))
    if (validationMode.value === 'onBlur') {
      void validation.commit(null)
    }
    onValueCommitted(null, createGenericEventDetails(REASONS.inputClear, event))
    return
  }

  const formatOptions = formatOptionsRef.value
  const parsedValue = parseNumber(inputValue.value, locale.value, formatOptions)
  if (parsedValue === null) {
    return
  }

  // Avoid applying Intl's default precision unless the format opts into rounding.
  const hasRoundingOptions = hasNumberFormatRoundingOptions(formatOptions)

  const committed = hasRoundingOptions
    ? removeFloatingPointErrors(parsedValue, formatOptions)
    : parsedValue

  const nextEventDetails = createGenericEventDetails(REASONS.inputBlur, event)
  const shouldUpdateValue = value.value !== committed
  const shouldCommit = hadManualInput || shouldUpdateValue || hadPendingProgrammaticChange

  // Use the stored value after `setValue` clamps it.
  let committedValue = committed
  if (shouldUpdateValue) {
    const changeDetails = createChangeEventDetails(REASONS.inputBlur, event)
    blockRevalidation = true
    setValue(committed, changeDetails)
    if (changeDetails.isCanceled) {
      blockRevalidation = false
      return
    }
    committedValue = lastChangedValueRef.value ?? committed
  }
  if (validationMode.value === 'onBlur') {
    void validation.commit(committedValue)
  }
  if (shouldCommit) {
    onValueCommitted(committedValue, nextEventDetails)
  }

  // Normalize only the displayed text
  const canonicalText = formatNumber(committedValue, locale.value, formatOptions)
  const shouldPreserveFullPrecision
    = !hasRoundingOptions
      && parsedValue === value.value
      && inputValue.value === formatNumberMaxPrecision(parsedValue, locale.value, formatOptions)

  if (!shouldPreserveFullPrecision && inputValue.value !== canonicalText) {
    setInputValue(canonicalText)
  }
}

function onInput(event: Event) {
  // Workaround for https://github.com/facebook/react/issues/9023
  if (event.defaultPrevented) {
    return
  }

  allowInputSyncRef.value = false
  const targetValue = (event.currentTarget as HTMLInputElement).value

  if (targetValue.trim() === '') {
    setInputValue(targetValue)
    setValue(null, createChangeEventDetails(REASONS.inputClear, event))
    return
  }

  // Update the input text immediately and only fire onValueChange if the typed value is
  // currently parseable into a number.
  const allowedNonNumericKeys = getAllowedNonNumericKeys()
  const isValidCharacterString = Array.from(targetValue).every((ch) => {
    const isAsciiDigit = ch >= '0' && ch <= '9'
    const isArabicNumeral = ARABIC_DETECT_RE.test(ch)
    const isHanNumeral = HAN_DETECT_RE.test(ch)
    const isPersianNumeral = PERSIAN_DETECT_RE.test(ch)
    const isFullwidthNumeral = FULLWIDTH_DETECT_RE.test(ch)
    const isMinus = ANY_MINUS_DETECT_RE.test(ch)
    return (
      isAsciiDigit
      || isArabicNumeral
      || isHanNumeral
      || isPersianNumeral
      || isFullwidthNumeral
      || isMinus
      || allowedNonNumericKeys.has(ch)
    )
  })

  if (!isValidCharacterString) {
    return
  }

  const parsedValue = parseNumber(targetValue, locale.value, formatOptionsRef.value)

  setInputValue(targetValue)

  if (parsedValue !== null) {
    setValue(parsedValue, createChangeEventDetails(REASONS.inputChange, event))
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || readOnly.value || disabled.value) {
    return
  }

  allowInputSyncRef.value = true

  const allowedNonNumericKeys = getAllowedNonNumericKeys()

  let isAllowedNonNumericKey = allowedNonNumericKeys.has(event.key)

  const { decimal, currency, percentSign } = getNumberLocaleDetails(
    locale.value,
    formatOptionsRef.value,
  )

  const target = event.currentTarget as HTMLInputElement
  const selectionStart = target.selectionStart
  const selectionEnd = target.selectionEnd
  const isAllSelected = selectionStart === 0 && selectionEnd === inputValue.value.length

  const selectionContainsIndex = (index: number) =>
    selectionStart != null
    && selectionEnd != null
    && index >= selectionStart
    && index < selectionEnd

  if (
    ANY_MINUS_DETECT_RE.test(event.key)
    && Array.from(allowedNonNumericKeys).some(k => ANY_MINUS_DETECT_RE.test(k || ''))
  ) {
    // Only allow one sign unless replacing the existing one or all text is selected
    const existingIndex = inputValue.value.search(ANY_MINUS_RE)
    const isReplacingExisting
      = existingIndex != null && existingIndex !== -1 && selectionContainsIndex(existingIndex)
    isAllowedNonNumericKey
      = !(ANY_MINUS_DETECT_RE.test(inputValue.value) || ANY_PLUS_DETECT_RE.test(inputValue.value))
        || isAllSelected
        || isReplacingExisting
  }
  if (
    ANY_PLUS_DETECT_RE.test(event.key)
    && Array.from(allowedNonNumericKeys).some(k => ANY_PLUS_DETECT_RE.test(k || ''))
  ) {
    const existingIndex = inputValue.value.search(ANY_PLUS_RE)
    const isReplacingExisting
      = existingIndex != null && existingIndex !== -1 && selectionContainsIndex(existingIndex)
    isAllowedNonNumericKey
      = !(ANY_MINUS_DETECT_RE.test(inputValue.value) || ANY_PLUS_DETECT_RE.test(inputValue.value))
        || isAllSelected
        || isReplacingExisting
  }

  // Only allow one of each symbol.
  ;[decimal, currency, percentSign].forEach((symbol) => {
    if (event.key === symbol && symbol) {
      const symbolIndex = inputValue.value.indexOf(symbol)
      const isSymbolHighlighted = selectionContainsIndex(symbolIndex)
      isAllowedNonNumericKey
        = !inputValue.value.includes(symbol) || isAllSelected || isSymbolHighlighted
    }
  })

  const isAsciiDigit = event.key >= '0' && event.key <= '9'
  const isArabicNumeral = ARABIC_DETECT_RE.test(event.key)
  const isHanNumeral = HAN_DETECT_RE.test(event.key)
  const isPersianNumeral = PERSIAN_DETECT_RE.test(event.key)
  const isFullwidthNumeral = FULLWIDTH_DETECT_RE.test(event.key)
  const isNavigateKey = NAVIGATE_KEYS.has(event.key)
  // Alt+ArrowUp/ArrowDown selects smallStep, so don't treat it as a bypass modifier.
  const isStepKey = event.key === 'ArrowUp' || event.key === 'ArrowDown'

  if (
    // Allow composition events (e.g., pinyin)
    (event as any).which === 229
    || (event.altKey && !isStepKey)
    || event.ctrlKey
    || event.metaKey
    || isAllowedNonNumericKey
    || isAsciiDigit
    || isArabicNumeral
    || isFullwidthNumeral
    || isHanNumeral
    || isPersianNumeral
    || isNavigateKey
  ) {
    return
  }

  // We need to commit the number at this point if the input hasn't been blurred.
  const parsedValue = parseNumber(inputValue.value, locale.value, formatOptionsRef.value)

  const amount = getStepAmount(event) ?? DEFAULT_STEP

  // Prevent insertion of text or caret from moving.
  stopEvent(event)

  const commitDetails = createGenericEventDetails(REASONS.keyboard, event)

  if (event.key === 'ArrowUp') {
    incrementValue(amount, {
      direction: 1,
      currentValue: parsedValue,
      event,
      reason: REASONS.keyboard,
    })
    onValueCommitted(lastChangedValueRef.value ?? valueRef.value, commitDetails)
  }
  else if (event.key === 'ArrowDown') {
    incrementValue(amount, {
      direction: -1,
      currentValue: parsedValue,
      event,
      reason: REASONS.keyboard,
    })
    onValueCommitted(lastChangedValueRef.value ?? valueRef.value, commitDetails)
  }
  else if (event.key === 'Home' && min.value != null) {
    setValue(min.value, createChangeEventDetails(REASONS.keyboard, event))
    onValueCommitted(lastChangedValueRef.value ?? valueRef.value, commitDetails)
  }
  else if (event.key === 'End' && max.value != null) {
    setValue(max.value, createChangeEventDetails(REASONS.keyboard, event))
    onValueCommitted(lastChangedValueRef.value ?? valueRef.value, commitDetails)
  }
}

function onPaste(event: ClipboardEvent) {
  if (event.defaultPrevented || readOnly.value || disabled.value) {
    return
  }

  let pastedData = ''

  try {
    pastedData = event.clipboardData?.getData('text/plain') ?? ''
  }
  catch {
    if (process.env.NODE_ENV !== 'production') {
      warn('<NumberFieldInput> could not read clipboard text during paste handling.')
    }
    return
  }

  // Prevent `onInput` from being called.
  event.preventDefault()

  const parsedValue = parseNumber(pastedData, locale.value, formatOptionsRef.value)

  if (parsedValue !== null) {
    allowInputSyncRef.value = false
    setValue(parsedValue, createChangeEventDetails(REASONS.inputPaste, event))
    setInputValue(pastedData)
  }
}

const inputProps = computed(() => mergeProps(
  attrsObject,
  validation.getValidationProps(),
  {
    'id': id.value,
    'required': required.value,
    'disabled': disabled.value,
    'readonly': readOnly.value,
    'inputmode': inputMode.value,
    'value': inputValue.value,
    'type': 'text',
    'autocomplete': 'off',
    'autocorrect': 'off',
    'spellcheck': 'false',
    'aria-roledescription': 'Number field',
    'aria-invalid': !disabled.value && invalid.value ? true : undefined,
    'aria-labelledby': labelId.value,
    'onFocus': onFocus,
    'onBlur': onBlur,
    'onInput': onInput,
    'onKeydown': onKeydown,
    'onPaste': onPaste,
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
  props: inputProps,
  stateAttributesMapping,
  defaultTagName: 'input',
  ref: setInputRef,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps" />
</template>
