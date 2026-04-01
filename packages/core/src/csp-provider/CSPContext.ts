import type { InjectionKey } from 'vue'
import { inject } from 'vue'

export interface CSPContextValue {
  nonce?: string
  disableStyleElements?: boolean
}

/**
 * @internal
 */
export const cspContextKey = Symbol(
  'CSPContext',
) as InjectionKey<CSPContextValue>

const DEFAULT_CSP_CONTEXT_VALUE: CSPContextValue = {
  disableStyleElements: false,
}

/**
 * @internal
 */
export function useCSPContext(): CSPContextValue {
  return inject(cspContextKey, DEFAULT_CSP_CONTEXT_VALUE)
}
