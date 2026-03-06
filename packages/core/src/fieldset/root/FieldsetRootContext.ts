import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface FieldsetRootContext {
  legendId: Ref<string | undefined>
  setLegendId: (id: string | undefined) => void
  disabled: Ref<boolean>
}

export const fieldsetRootContextKey: InjectionKey<FieldsetRootContext> = Symbol(
  'FieldsetRootContext',
)

export function useFieldsetRootContext(
  optional: true,
): FieldsetRootContext | undefined
export function useFieldsetRootContext(optional?: false): FieldsetRootContext
export function useFieldsetRootContext(optional = false) {
  const context = inject(fieldsetRootContextKey, undefined)
  if (!context && !optional) {
    throw new Error(
      'Base UI Vue: FieldsetRootContext is missing. Fieldset parts must be placed within <FieldsetRoot>.',
    )
  }
  return context
}
