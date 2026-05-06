import type { InjectionKey } from 'vue'
import { inject } from 'vue'

export interface ScrollAreaViewportContext {
  computeThumbPosition: () => void
}

export const scrollAreaViewportContextKey = Symbol(
  'ScrollAreaViewportContext',
) as InjectionKey<ScrollAreaViewportContext>

export function useScrollAreaViewportContext(): ScrollAreaViewportContext {
  const context = inject(scrollAreaViewportContextKey)
  if (context === undefined) {
    throw new Error(
      'Base UI: ScrollAreaViewportContext is missing. ScrollArea.Content must be placed within <ScrollAreaViewport>.',
    )
  }
  return context
}
