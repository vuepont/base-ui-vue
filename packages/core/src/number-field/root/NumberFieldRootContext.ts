import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type {
  BaseUIChangeEventDetails,
  BaseUIGenericEventDetails,
} from '../../utils/createBaseUIEventDetails'
import type { REASONS } from '../../utils/reasons'
import type {
  ChangeEventCustomProperties,
  EventWithOptionalKeyState,
  IncrementValueParameters,
} from '../utils/types'
import type { NumberFieldRootState } from './NumberFieldRoot.vue'
import { inject } from 'vue'

export type InputMode = 'numeric' | 'decimal' | 'text'

export type NumberFieldRootChangeEventReason
  = | typeof REASONS.inputChange
    | typeof REASONS.inputClear
    | typeof REASONS.inputBlur
    | typeof REASONS.inputPaste
    | typeof REASONS.keyboard
    | typeof REASONS.incrementPress
    | typeof REASONS.decrementPress
    | typeof REASONS.wheel
    | typeof REASONS.scrub
    | typeof REASONS.none
export type NumberFieldRootChangeEventDetails = BaseUIChangeEventDetails<
  NumberFieldRootChangeEventReason,
  ChangeEventCustomProperties
>

export type NumberFieldRootCommitEventReason
  = | typeof REASONS.inputBlur
    | typeof REASONS.inputClear
    | typeof REASONS.keyboard
    | typeof REASONS.incrementPress
    | typeof REASONS.decrementPress
    | typeof REASONS.wheel
    | typeof REASONS.scrub
    | typeof REASONS.none
export type NumberFieldRootCommitEventDetails
  = BaseUIGenericEventDetails<NumberFieldRootCommitEventReason>

export interface NumberFieldRootContext {
  inputValue: Readonly<Ref<string>>
  value: Readonly<Ref<number | null>>
  minWithDefault: ComputedRef<number>
  maxWithDefault: ComputedRef<number>
  disabled: ComputedRef<boolean>
  readOnly: ComputedRef<boolean>
  id: ComputedRef<string | undefined>
  setValue: (value: number | null, details: NumberFieldRootChangeEventDetails) => boolean
  getStepAmount: (event?: EventWithOptionalKeyState) => number | undefined
  incrementValue: (amount: number, params: IncrementValueParameters) => boolean
  inputRef: Ref<HTMLInputElement | null>
  allowInputSyncRef: Ref<boolean>
  formatOptionsRef: ComputedRef<Intl.NumberFormatOptions | undefined>
  valueRef: Ref<number | null>
  lastChangedValueRef: Ref<number | null>
  hasPendingCommitRef: Ref<boolean>
  name: ComputedRef<string | undefined>
  nameProp: ComputedRef<string | undefined>
  required: ComputedRef<boolean>
  invalid: Readonly<Ref<boolean | undefined>>
  inputMode: Readonly<Ref<InputMode>>
  getAllowedNonNumericKeys: () => Set<string | undefined>
  min: ComputedRef<number | undefined>
  max: ComputedRef<number | undefined>
  setInputValue: (value: string) => void
  locale: ComputedRef<Intl.LocalesArgument>
  isScrubbing: Readonly<Ref<boolean>>
  setIsScrubbing: (value: boolean) => void
  state: ComputedRef<NumberFieldRootState>
  onValueCommitted: (
    value: number | null,
    eventDetails: NumberFieldRootCommitEventDetails,
  ) => void
}

export const numberFieldRootContextKey: InjectionKey<NumberFieldRootContext>
  = Symbol('NumberFieldRootContext')

export function useNumberFieldRootContext() {
  const context = inject(numberFieldRootContextKey, undefined)

  if (context === undefined) {
    throw new Error(
      'Base UI Vue: NumberFieldRootContext is missing. NumberField parts must be placed within <NumberFieldRoot>.',
    )
  }

  return context
}
