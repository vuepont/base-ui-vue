import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface FieldsetRootContext {
  legendId: Ref<string | undefined>
  setLegendId: (id: string | undefined) => void
  disabled: Ref<boolean>
}

export const fieldsetRootContextKey: InjectionKey<FieldsetRootContext>
  = Symbol('FieldsetRootContext')

export function useFieldsetRootContext(): FieldsetRootContext {
  const context = inject(fieldsetRootContextKey, undefined)
  if (context === undefined) {
    throw new Error(
      'Base UI Vue: FieldsetRootContext is missing. Fieldset parts must be placed within <FieldsetRoot>.',
    )
  }
  return context
}
