import type { InjectionKey, Ref } from 'vue'
import { computed, inject } from 'vue'

export interface CSPContextValue {
  nonce: Readonly<Ref<string | undefined>>
  disableStyleElements: Readonly<Ref<boolean>>
}

/**
 * @internal
 */
export const cspContextKey = Symbol(
  'CSPContext',
) as InjectionKey<CSPContextValue>

const DEFAULT_CSP_CONTEXT_VALUE: CSPContextValue = {
  nonce: computed(() => undefined),
  disableStyleElements: computed(() => false),
}

/**
 * @internal
 */
export function useCSPContext(): CSPContextValue {
  return inject(cspContextKey, DEFAULT_CSP_CONTEXT_VALUE)
}
