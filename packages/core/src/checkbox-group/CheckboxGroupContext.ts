import type { InjectionKey, Ref } from 'vue'
import type { UseFieldValidationReturnValue } from '../field/root/useFieldValidation'
import type { BaseUIChangeEventDetails } from '../utils/createBaseUIEventDetails'
import type { REASONS } from '../utils/reasons'
import type { UseCheckboxGroupParentReturnValue } from './useCheckboxGroupParent'
import { inject } from 'vue'

export interface CheckboxGroupContext {
  value: Readonly<Ref<string[]>>
  defaultValue: Readonly<Ref<string[]>>
  allValues: Readonly<Ref<string[] | undefined>>
  disabled: Readonly<Ref<boolean>>
  validation: UseFieldValidationReturnValue
  parent: UseCheckboxGroupParentReturnValue
  setValue: (
    value: string[],
    eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
  ) => void
  registerControlRef: (element: HTMLElement | null) => void
}

export const checkboxGroupContextKey: InjectionKey<CheckboxGroupContext> = Symbol(
  'CheckboxGroupContext',
)

export function useCheckboxGroupContext(
  optional: true,
): CheckboxGroupContext | undefined
export function useCheckboxGroupContext(optional?: false): CheckboxGroupContext
export function useCheckboxGroupContext(optional = false) {
  const context = inject(checkboxGroupContextKey, undefined)
  if (!context && !optional) {
    throw new Error(
      'Base UI Vue: CheckboxGroupContext is missing. CheckboxGroup parts must be placed within <CheckboxGroup>.',
    )
  }

  return context
}
