import type { InjectionKey, Ref } from 'vue'
import { inject, ref } from 'vue'

export interface FieldItemContext {
  disabled: Ref<boolean>
}

const defaultContext: FieldItemContext = {
  disabled: ref(false),
}

export const fieldItemContextKey: InjectionKey<FieldItemContext> = Symbol('FieldItemContext')

export function useFieldItemContext(): FieldItemContext {
  return inject(fieldItemContextKey, defaultContext)
}
