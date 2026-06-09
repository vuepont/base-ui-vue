import type { InjectionKey, Ref } from 'vue'
import type { RadioRootState } from './RadioRoot.vue'
import { inject } from 'vue'

export type RadioRootContext = Readonly<Ref<RadioRootState>>

export const radioRootContextKey: InjectionKey<RadioRootContext> = Symbol('RadioRootContext')

export function useRadioRootContext() {
  const context = inject(radioRootContextKey, undefined)
  if (!context) {
    throw new Error(
      'Base UI Vue: RadioRootContext is missing. Radio parts must be placed within <RadioRoot>.',
    )
  }

  return context
}
