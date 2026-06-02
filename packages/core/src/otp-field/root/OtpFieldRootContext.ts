import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type {
  BaseUIChangeEventDetails,
  BaseUIGenericEventDetails,
} from '../../utils/createBaseUIEventDetails'
import type { REASONS } from '../../utils/reasons'
import type { OtpFieldInputState } from '../input/OtpFieldInput.vue'
import type { OtpValidationType } from '../utils/otp'
import type { OtpFieldRootState } from './OtpFieldRoot.vue'
import { inject } from 'vue'

export type OtpFieldRootChangeEventReason
  = | typeof REASONS.inputChange
    | typeof REASONS.inputClear
    | typeof REASONS.inputPaste
    | typeof REASONS.keyboard
export type OtpFieldRootChangeEventDetails
  = BaseUIChangeEventDetails<OtpFieldRootChangeEventReason>

export type OtpFieldRootInvalidEventReason = typeof REASONS.inputChange | typeof REASONS.inputPaste
export type OtpFieldRootInvalidEventDetails
  = BaseUIGenericEventDetails<OtpFieldRootInvalidEventReason>

export type OtpFieldRootCompleteEventReason
  = | typeof REASONS.inputChange
    | typeof REASONS.inputPaste
export type OtpFieldRootCompleteEventDetails
  = BaseUIGenericEventDetails<OtpFieldRootCompleteEventReason>

export interface OtpFieldRootContext {
  activeIndex: ComputedRef<number>
  autoComplete: ComputedRef<string | undefined>
  disabled: ComputedRef<boolean>
  form: ComputedRef<string | undefined>
  focusInput: (index: number) => void
  queueFocusInput: (index: number, value: string) => void
  getInputId: (index: number) => string | undefined
  handleInputBlur: (event: FocusEvent) => void
  handleInputFocus: (index: number, event: FocusEvent) => void
  inputMode: ComputedRef<string | undefined>
  inputAriaLabelledBy: ComputedRef<string | undefined>
  invalid: Readonly<Ref<boolean | undefined>>
  length: ComputedRef<number>
  mask: ComputedRef<boolean>
  pattern: ComputedRef<string | undefined>
  reportValueInvalid: (value: string, details: OtpFieldRootInvalidEventDetails) => void
  readOnly: ComputedRef<boolean>
  required: ComputedRef<boolean>
  normalizeValue: ComputedRef<((value: string) => string) | undefined>
  setValue: (value: string, details: OtpFieldRootChangeEventDetails) => string | null
  state: ComputedRef<OtpFieldRootState>
  validationType: ComputedRef<OtpValidationType>
  value: ComputedRef<string>
}

export const otpFieldRootContextKey: InjectionKey<OtpFieldRootContext> = Symbol('OtpFieldRootContext')

export function useOtpFieldRootContext() {
  const context = inject(otpFieldRootContextKey, undefined)

  if (context === undefined) {
    throw new Error(
      'Base UI Vue: OtpFieldRootContext is missing. OtpField parts must be placed within <OtpFieldRoot>.',
    )
  }

  return context
}

export function getOtpFieldInputState(
  state: OtpFieldRootState,
  value: string,
  index: number,
): OtpFieldInputState {
  return {
    ...state,
    value,
    index,
    filled: value !== '',
  }
}
