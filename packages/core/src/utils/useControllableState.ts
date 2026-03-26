import type { Ref } from 'vue'
import { computed, ref } from 'vue'

export interface UseControllableStateParameters<T> {
  /**
   * The controlled value. When not `undefined`, the state is considered controlled.
   */
  controlled: () => T | undefined
  /**
   * The default value used when uncontrolled.
   */
  default: T
}

export interface UseControllableStateReturnValue<T> {
  value: Readonly<Ref<T>>
  setValue: (next: T) => void
}

/**
 * Manages controlled / uncontrolled state
 * - When `controlled()` returns a non-`undefined` value the component is
 *   considered **controlled** and the internal state is ignored.
 * - When `controlled()` returns `undefined` the component is **uncontrolled**
 *   and the internal ref drives the value.
 */
export function useControllableState<T>(
  params: UseControllableStateParameters<T>,
): UseControllableStateReturnValue<T> {
  const internalValue = ref<T>(params.default) as Ref<T>

  const value = computed<T>(() => {
    const c = params.controlled()
    return c !== undefined ? c : internalValue.value
  })

  function setValue(next: T) {
    internalValue.value = next
  }

  return { value, setValue }
}
