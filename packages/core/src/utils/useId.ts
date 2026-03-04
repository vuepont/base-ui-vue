import { useId as vueUseId } from 'vue'

let globalId = 0

/**
 * Generates a unique ID string, optionally prefixed.
 * Uses Vue 3.5+ `useId()` when available, otherwise falls back to an
 * incrementing counter (client-side only, not SSR-safe).
 *
 * @param idOverride - If provided, returned as-is.
 * @param prefix - Optional prefix prepended to the generated id.
 */
export function useId(idOverride?: string, prefix?: string): string | undefined {
  if (idOverride != null) {
    return idOverride
  }

  if (typeof vueUseId === 'function') {
    const reactId = vueUseId()
    return prefix ? `${prefix}-${reactId}` : reactId
  }

  globalId += 1
  const id = String(globalId)
  return prefix ? `${prefix}-${id}` : id
}
