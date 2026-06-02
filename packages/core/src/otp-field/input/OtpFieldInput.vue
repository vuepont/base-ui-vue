<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { BaseUIComponentProps } from '../../utils/types'
import type { OtpFieldRootState } from '../root/OtpFieldRoot.vue'
import { computed, ref, useAttrs } from 'vue'
import { IndexGuessBehavior, useCompositeListItem } from '../../composite/list/useCompositeListItem'
import { useDirection } from '../../direction-provider/DirectionContext'
import { stopEvent } from '../../floating-ui-vue/utils'
import { mergeProps } from '../../merge-props/mergeProps'
import { createChangeEventDetails, createGenericEventDetails } from '../../utils/createBaseUIEventDetails'
import { REASONS } from '../../utils/reasons'
import { useRenderElement } from '../../utils/useRenderElement'
import { getOtpFieldInputState, useOtpFieldRootContext } from '../root/OtpFieldRootContext'
import { normalizeOTPValueWithDetails, removeOTPCharacter, replaceOTPValue } from '../utils/otp'
import { inputStateAttributesMapping } from '../utils/stateAttributesMapping'

export interface OtpFieldInputState extends Omit<OtpFieldRootState, 'filled' | 'value'> {
  /**
   * Whether this input contains a character.
   */
  filled: boolean
  /**
   * The input index.
   */
  index: number
  /**
   * The character rendered in this slot.
   */
  value: string
}

export interface OtpFieldInputProps extends BaseUIComponentProps<OtpFieldInputState> {}

defineOptions({
  name: 'OtpFieldInput',
  inheritAttrs: false,
})

const props = defineProps<OtpFieldInputProps>()

const attrs = useAttrs()
const attrsObject = attrs as Record<string, any>

const {
  activeIndex,
  autoComplete,
  disabled,
  form,
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
  normalizeValue,
  setValue,
  state,
  validationType,
  value,
} = useOtpFieldRootContext()

const { ref: listItemRef, index } = useCompositeListItem({
  indexGuessBehavior: () => IndexGuessBehavior.GuessFromOrder,
})
const inputRef = ref<HTMLInputElement | null>(null)
const direction = useDirection()

const slotValue = computed(() => value.value[index.value] ?? '')
const inputState = computed(() => getOtpFieldInputState(state.value, slotValue.value, index.value))

const externalAriaLabel = computed(() => attrs['aria-label'] as string | undefined)
const externalAriaLabelledBy = computed(() => attrs['aria-labelledby'] as string | undefined)
const inheritedLabel = computed(() => externalAriaLabelledBy.value ?? inputAriaLabelledBy.value)
const ariaLabel = computed(() => (index.value === 0 ? undefined : externalAriaLabel.value))

function setInputRef(el: Element | ComponentPublicInstance | null) {
  listItemRef(el as HTMLElement | null)
  inputRef.value = el as HTMLInputElement | null
}

function onMousedown(event: MouseEvent) {
  if (event.defaultPrevented || disabled.value) {
    return
  }

  event.preventDefault()
  focusInput(index.value)
}

function onFocus(event: FocusEvent) {
  if (event.defaultPrevented || disabled.value) {
    return
  }

  handleInputFocus(index.value, event)
}

function onBlur(event: FocusEvent) {
  if (event.defaultPrevented) {
    return
  }

  handleInputBlur(event)
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (event.defaultPrevented || disabled.value || readOnly.value) {
    return
  }

  const rawValue = target.value
  const [nextDigits, didRejectCharacters] = normalizeOTPValueWithDetails(
    rawValue,
    length.value,
    validationType.value,
    normalizeValue.value,
  )

  if (didRejectCharacters) {
    reportValueInvalid(rawValue, createGenericEventDetails(REASONS.inputChange, event))
  }

  if (nextDigits === '') {
    if (rawValue === '') {
      setValue(
        removeOTPCharacter(value.value, index.value),
        createChangeEventDetails(REASONS.inputClear, event),
      )
    }
    else if (slotValue.value !== '') {
      target.value = slotValue.value
      target.select()
    }
    return
  }

  const nextValue = replaceOTPValue(
    value.value,
    index.value,
    nextDigits,
    length.value,
    validationType.value,
    normalizeValue.value,
  )

  const committedValue = setValue(nextValue, createChangeEventDetails(REASONS.inputChange, event))

  if (committedValue != null) {
    const nextInput = Math.min(index.value + nextDigits.length, length.value - 1)
    queueFocusInput(nextInput, committedValue)
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || disabled.value) {
    return
  }

  const firstIndex = 0
  const lastIndex = Math.max(length.value - 1, firstIndex)
  const endTargetIndex = Math.min(value.value.length, lastIndex)
  const hasBoundaryModifier = (event.ctrlKey || event.metaKey) && !event.altKey
  const isRtl = direction.value === 'rtl'
  const previousKey = isRtl ? 'ArrowRight' : 'ArrowLeft'
  const nextKey = isRtl ? 'ArrowLeft' : 'ArrowRight'

  if (event.key === previousKey) {
    stopEvent(event)
    focusInput(hasBoundaryModifier ? firstIndex : Math.max(firstIndex, index.value - 1))
    return
  }

  if (event.key === nextKey) {
    stopEvent(event)
    focusInput(hasBoundaryModifier ? endTargetIndex : Math.min(lastIndex, index.value + 1))
    return
  }

  if (event.key === 'Home' || event.key === 'ArrowUp') {
    stopEvent(event)
    focusInput(firstIndex)
    return
  }

  if (event.key === 'End' || event.key === 'ArrowDown') {
    stopEvent(event)
    focusInput(endTargetIndex)
    return
  }

  if (readOnly.value) {
    return
  }

  function setKeyboardValue(nextValue: string, targetIndex: number) {
    const committedValue = setValue(nextValue, createChangeEventDetails(REASONS.keyboard, event))

    if (committedValue != null) {
      queueFocusInput(targetIndex, committedValue)
    }
  }

  if (event.key === 'Backspace' && hasBoundaryModifier) {
    stopEvent(event)
    setKeyboardValue('', firstIndex)
    return
  }

  if (event.key === 'Delete') {
    stopEvent(event)
    setKeyboardValue(removeOTPCharacter(value.value, index.value), index.value)
    return
  }

  const target = event.currentTarget as HTMLInputElement
  const inputValue = target.value
  const fullSelection = target.selectionStart === 0 && target.selectionEnd === inputValue.length

  if (event.key.length === 1 && fullSelection && slotValue.value === event.key) {
    stopEvent(event)
    if (index.value < length.value - 1) {
      focusInput(index.value + 1)
    }
    return
  }

  if (event.key === 'Backspace') {
    stopEvent(event)
    const targetIndex = Math.max(firstIndex, index.value - 1)
    const deleteIndex = slotValue.value === '' ? targetIndex : index.value
    setKeyboardValue(removeOTPCharacter(value.value, deleteIndex), targetIndex)
  }
}

function onPaste(event: ClipboardEvent) {
  if (event.defaultPrevented || disabled.value || readOnly.value) {
    return
  }

  let rawValue = ''

  try {
    rawValue = event.clipboardData?.getData('text/plain') ?? ''
  }
  catch {
    return
  }

  event.preventDefault()

  const [nextDigits, didRejectCharacters] = normalizeOTPValueWithDetails(
    rawValue,
    length.value,
    validationType.value,
    normalizeValue.value,
  )

  if (didRejectCharacters) {
    reportValueInvalid(rawValue, createGenericEventDetails(REASONS.inputPaste, event))
  }

  if (nextDigits === '') {
    return
  }

  const committedValue = setValue(
    replaceOTPValue(value.value, index.value, nextDigits, length.value, validationType.value, normalizeValue.value),
    createChangeEventDetails(REASONS.inputPaste, event),
  )

  if (committedValue != null) {
    const nextInput = Math.min(index.value + nextDigits.length, length.value - 1)
    queueFocusInput(nextInput, committedValue)
  }
}

const inputProps = computed(() => mergeProps(
  attrsObject,
  {
    'id': getInputId(index.value),
    'value': slotValue.value,
    'type': mask.value ? 'password' : 'text',
    'inputmode': inputMode.value,
    'autocomplete': index.value === 0 ? autoComplete.value : 'off',
    'autocorrect': 'off',
    'spellcheck': 'false',
    'enterkeyhint': index.value === length.value - 1 ? 'done' : 'next',
    // Only the first slot has a max length to avoid password manager bubbles appearing after later inputs.
    'maxlength': index.value === 0 ? length.value : undefined,
    'tabindex': activeIndex.value === index.value ? 0 : -1,
    'disabled': disabled.value,
    'form': form.value,
    'pattern': pattern.value,
    'readonly': readOnly.value,
    'required': required.value,
    'aria-labelledby': ariaLabel.value == null ? inheritedLabel.value : undefined,
    'aria-invalid': !disabled.value && invalid.value ? true : undefined,
    'aria-label': ariaLabel.value,
    'onMousedown': onMousedown,
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
  state: inputState,
  props: inputProps,
  stateAttributesMapping: inputStateAttributesMapping,
  defaultTagName: 'input',
  ref: setInputRef,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="inputState" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps" />
</template>
