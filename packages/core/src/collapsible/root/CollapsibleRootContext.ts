import type { InjectionKey } from 'vue'
import type { UseCollapsibleRootReturnValue } from './useCollapsibleRoot'
import { inject } from 'vue'

export interface CollapsibleRootContext extends UseCollapsibleRootReturnValue {}

export const collapsibleRootContextKey: InjectionKey<CollapsibleRootContext>
  = Symbol('CollapsibleRootContext')

export function useCollapsibleRootContext(): CollapsibleRootContext {
  const context = inject(collapsibleRootContextKey, undefined)
  if (context === undefined) {
    throw new Error(
      'Base UI Vue: CollapsibleRootContext is missing. Collapsible parts must be placed within <CollapsibleRoot>.',
    )
  }
  return context
}
