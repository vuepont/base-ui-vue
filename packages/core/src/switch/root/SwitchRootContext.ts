import type { InjectionKey, Ref } from 'vue'
import type { SwitchRootState } from './SwitchRoot.vue'
import { inject } from 'vue'

export type SwitchRootContext = Readonly<Ref<SwitchRootState>>

export const switchRootContextKey: InjectionKey<SwitchRootContext> = Symbol(
  'SwitchRootContext',
)

export function useSwitchRootContext(optional: true): SwitchRootContext | undefined
export function useSwitchRootContext(optional?: false): SwitchRootContext
export function useSwitchRootContext(optional = false) {
  const context = inject(switchRootContextKey, undefined)
  if (!context && !optional) {
    throw new Error(
      'Base UI Vue: SwitchRootContext is missing. Switch parts must be placed within <SwitchRoot>.',
    )
  }

  return context
}
