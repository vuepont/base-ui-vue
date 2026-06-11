import type { InjectionKey, Ref } from 'vue'
import type { UseFieldValidationReturnValue } from '../field/root/useFieldValidation'
import type { BaseUIChangeEventDetails } from '../utils/createBaseUIEventDetails'
import type { REASONS } from '../utils/reasons'
import { inject } from 'vue'

export interface RadioGroupContext<Value = any> {
  disabled: Readonly<Ref<boolean | undefined>>
  readOnly: Readonly<Ref<boolean | undefined>>
  required: Readonly<Ref<boolean | undefined>>
  form: Readonly<Ref<string | undefined>>
  name: Readonly<Ref<string | undefined>>
  checkedValue: Readonly<Ref<Value | undefined>>
  touched: Readonly<Ref<boolean>>
  validation?: UseFieldValidationReturnValue
  setCheckedValue: (
    value: Value,
    eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
  ) => void
  setTouched: (value: boolean) => void
  registerControlRef: (element: HTMLElement | null, disabled?: boolean) => void
  registerInputRef: (element: HTMLInputElement | null, checked?: boolean) => void
}

export const radioGroupContextKey: InjectionKey<RadioGroupContext<any>> = Symbol(
  'RadioGroupContext',
)

export function useRadioGroupContext(
  optional: true,
): RadioGroupContext | undefined
export function useRadioGroupContext(optional?: false): RadioGroupContext
export function useRadioGroupContext(optional = false) {
  const context = inject(radioGroupContextKey, undefined)
  if (!context && !optional) {
    throw new Error(
      'Base UI Vue: RadioGroupContext is missing. Radio parts must be placed within a radio group.',
    )
  }

  return context
}
