import type { InjectionKey } from 'vue'
import { inject } from 'vue'

export type TextDirection = 'ltr' | 'rtl'

export const directionContextKey = Symbol(
  'DirectionContext',
) as InjectionKey<TextDirection>

export function useDirection() {
  return inject(directionContextKey, 'ltr')
}
