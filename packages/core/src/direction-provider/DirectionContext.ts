import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { computed, inject } from 'vue'

export type TextDirection = 'ltr' | 'rtl'

export interface DirectionContextValue {
  direction: Ref<TextDirection>
}

/**
 * @internal
 */
export const directionContextKey = Symbol(
  'DirectionContext',
) as InjectionKey<DirectionContextValue>

export interface DirectionProviderProps {
  /**
   * The reading direction of the text
   * @default 'ltr'
   */
  direction?: TextDirection
}

export function useDirection(): ComputedRef<TextDirection> {
  const context = inject(directionContextKey, undefined)

  return computed(() => context?.direction.value ?? 'ltr')
}
