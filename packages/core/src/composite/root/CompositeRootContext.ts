import type { InjectionKey } from 'vue'
import { inject } from 'vue'

export interface CompositeRootContext {
  highlightedIndex: number
  onHighlightedIndexChange: (
    index: number,
    shouldScrollIntoView?: boolean,
  ) => void
  highlightItemOnHover: boolean
  /**
   * Makes it possible to control composite components using events that don't originate from their children.
   * For example, a Menubar with detached triggers may define its Menu.Root outside of CompositeRoot.
   * Keyboard events that occur within this menu won't normally be captured by the CompositeRoot,
   * so they need to be forwarded manually using this function.
   */
  relayKeyboardEvent: (event: KeyboardEvent) => void
}

export const compositeRootContextKey: InjectionKey<CompositeRootContext>
  = Symbol('CompositeRootContext')

export function useCompositeRootContext(
  optional: true,
): CompositeRootContext | undefined
export function useCompositeRootContext(optional?: false): CompositeRootContext
export function useCompositeRootContext(optional = false) {
  const context = inject(compositeRootContextKey, undefined)
  if (context === undefined && !optional) {
    throw new Error(
      'Base UI Vue: CompositeRootContext is missing. Composite parts must be placed within <CompositeRoot>.',
    )
  }

  return context
}
