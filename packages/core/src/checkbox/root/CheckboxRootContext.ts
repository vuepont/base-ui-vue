import type { InjectionKey, Ref } from 'vue'
import type { CheckboxRootState } from './CheckboxRoot.vue'
import { inject } from 'vue'

export type CheckboxRootContext = Readonly<Ref<CheckboxRootState>>

export const checkboxRootContextKey: InjectionKey<CheckboxRootContext> = Symbol(
  'CheckboxRootContext',
)

export function useCheckboxRootContext(optional: true): CheckboxRootContext | undefined
export function useCheckboxRootContext(optional?: false): CheckboxRootContext
export function useCheckboxRootContext(optional = false) {
  const context = inject(checkboxRootContextKey, undefined)
  if (!context && !optional) {
    throw new Error(
      'Base UI Vue: CheckboxRootContext is missing. Checkbox parts must be placed within <CheckboxRoot>.',
    )
  }

  return context
}
