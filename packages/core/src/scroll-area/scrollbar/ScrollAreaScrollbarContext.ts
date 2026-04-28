import type { ComputedRef, InjectionKey } from 'vue'
import { inject } from 'vue'

export interface ScrollAreaScrollbarContext {
  orientation: ComputedRef<'horizontal' | 'vertical'>
}

export const scrollAreaScrollbarContextKey = Symbol(
  'ScrollAreaScrollbarContext',
) as InjectionKey<ScrollAreaScrollbarContext>

export function useScrollAreaScrollbarContext(): ScrollAreaScrollbarContext {
  const context = inject(scrollAreaScrollbarContextKey)
  if (context === undefined) {
    throw new Error(
      'Base UI: ScrollAreaScrollbarContext is missing. ScrollArea.Thumb must be placed within <ScrollAreaScrollbar>.',
    )
  }
  return context
}
