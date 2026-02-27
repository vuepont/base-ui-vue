import type { InjectionKey } from 'vue'
import { inject } from 'vue'

export type TextDirection = 'ltr' | 'rtl'

export interface DirectionContextValue {
  direction: TextDirection
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

export function useDirection(): TextDirection {
  const context = inject(directionContextKey, undefined)
  const direction = context?.direction ?? 'ltr'

  return direction
}
