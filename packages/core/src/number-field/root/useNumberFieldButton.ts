import type { ComputedRef, Ref } from 'vue'
import type {
  Direction,
  EventWithOptionalKeyState,
  IncrementValueParameters,
} from '../utils/types'
import type {
  NumberFieldRootChangeEventDetails,
  NumberFieldRootChangeEventReason,
  NumberFieldRootCommitEventDetails,
} from './NumberFieldRootContext'
import { computed } from 'vue'
import {
  createChangeEventDetails,
  createGenericEventDetails,
} from '../../utils/createBaseUIEventDetails'
import { REASONS } from '../../utils/reasons'
import { usePressAndHold } from '../../utils/usePressAndHold'
import {
  CHANGE_VALUE_TICK_DELAY,
  DEFAULT_STEP,
  SCROLLING_POINTER_MOVE_DISTANCE,
  START_AUTO_CHANGE_DELAY,
} from '../utils/constants'
import { parseNumber } from '../utils/parse'

// Treat pen as touch-like to avoid forcing the software keyboard on stylus taps.
function isTouchLikePointerType(pointerType: string) {
  return pointerType === 'touch' || pointerType === 'pen'
}

export interface UseNumberFieldButtonParameters {
  isIncrement: boolean
  inputRef: Ref<HTMLInputElement | null>
  inputValue: () => string
  disabled: () => boolean
  readOnly: () => boolean
  id: () => string | undefined
  setValue: (value: number | null, details: NumberFieldRootChangeEventDetails) => boolean
  getStepAmount: (event?: EventWithOptionalKeyState) => number | undefined
  incrementValue: (amount: number, params: IncrementValueParameters) => boolean
  allowInputSyncRef: Ref<boolean>
  formatOptionsRef: ComputedRef<Intl.NumberFormatOptions | undefined>
  valueRef: Ref<number | null>
  locale: () => Intl.LocalesArgument
  lastChangedValueRef: Ref<number | null>
  onValueCommitted: (value: number | null, eventDetails: NumberFieldRootCommitEventDetails) => void
}

export function useNumberFieldButton(
  params: UseNumberFieldButtonParameters,
): ComputedRef<Record<string, any>> {
  const {
    allowInputSyncRef,
    formatOptionsRef,
    getStepAmount,
    incrementValue,
    inputRef,
    inputValue,
    isIncrement,
    locale,
    setValue,
    valueRef,
    lastChangedValueRef,
    onValueCommitted,
  } = params

  const disabled = () => params.disabled()
  const readOnly = () => params.readOnly()

  const pressReason: NumberFieldRootChangeEventReason = isIncrement
    ? REASONS.incrementPress
    : REASONS.decrementPress

  function commitValue(nativeEvent: MouseEvent) {
    allowInputSyncRef.value = true

    // The input may be dirty but not yet blurred, so the value won't have been committed.
    const parsedValue = parseNumber(inputValue(), locale(), formatOptionsRef.value)

    if (parsedValue !== null) {
      // The increment value function needs to know the current input value to increment it
      // correctly.
      valueRef.value = parsedValue
      setValue(
        parsedValue,
        createChangeEventDetails<NumberFieldRootChangeEventReason, { direction?: Direction }>(
          pressReason,
          nativeEvent,
          undefined,
          { direction: isIncrement ? 1 : -1 },
        ),
      )
    }
  }

  const { pointerHandlers, shouldSkipClick } = usePressAndHold({
    disabled: () => disabled() || readOnly(),
    elementRef: inputRef,
    tickDelay: CHANGE_VALUE_TICK_DELAY,
    startDelay: START_AUTO_CHANGE_DELAY,
    scrollDistance: SCROLLING_POINTER_MOVE_DISTANCE,
    tick(triggerEvent) {
      const amount = getStepAmount(triggerEvent as EventWithOptionalKeyState) ?? DEFAULT_STEP
      return incrementValue(amount, {
        direction: isIncrement ? 1 : -1,
        event: triggerEvent,
        reason: pressReason,
      })
    },
    onStop(nativeEvent: PointerEvent) {
      const committed = lastChangedValueRef.value ?? valueRef.value
      onValueCommitted(committed, createGenericEventDetails(pressReason, nativeEvent))
    },
  })

  return computed<Record<string, any>>(() => ({
    'disabled': disabled(),
    'aria-readonly': readOnly() || undefined,
    'aria-label': isIncrement ? 'Increase' : 'Decrease',
    'aria-controls': params.id(),
    // Keyboard users shouldn't have access to the buttons, since they can use the input element
    // to change the value. On the other hand, `aria-hidden` is not applied because touch screen
    // readers should be able to use the buttons.
    'tabindex': -1,
    'style': {
      WebkitUserSelect: 'none',
      userSelect: 'none',
    },
    ...pointerHandlers,
    onClick(event: MouseEvent) {
      const isDisabled = disabled() || readOnly()
      if (event.defaultPrevented || isDisabled || shouldSkipClick(event)) {
        return
      }

      commitValue(event)

      const amount = getStepAmount(event as EventWithOptionalKeyState) ?? DEFAULT_STEP

      const prev = valueRef.value

      incrementValue(amount, {
        direction: isIncrement ? 1 : -1,
        event,
        reason: pressReason,
      })

      const committed = lastChangedValueRef.value ?? valueRef.value
      if (committed !== prev) {
        onValueCommitted(committed, createGenericEventDetails(pressReason, event))
      }
    },
    onPointerdown(event: PointerEvent) {
      const isMainButton = !event.button || event.button === 0
      if (event.defaultPrevented || readOnly() || !isMainButton || disabled()) {
        return
      }

      // Sync dirty input value before starting the hold sequence.
      commitValue(event)

      if (!isTouchLikePointerType(event.pointerType)) {
        // Focus the input so the user can continue with keyboard interactions.
        inputRef.value?.focus()
      }

      pointerHandlers.onPointerdown(event)
    },
  }))
}
