import { useId } from './useId'

/**
 * Wraps `useId` and prefixes generated IDs with `base-ui-`.
 * @param idOverride - If provided, returned as-is.
 */
export function useBaseUiId(idOverride?: string): string | undefined {
  return useId(idOverride, 'base-ui')
}
