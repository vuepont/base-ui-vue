import type { ComponentPublicInstance, Ref } from 'vue'

type Cleanup = () => void
type MaybeRef<T>
  = | Ref<T | null>
    | ((el: T | null) => void | Cleanup)
    | null
    | undefined

/**
 * Merges multiple refs or ref callbacks into a single template ref callback.
 * Returns `undefined` when all input refs are nullish (optimization to avoid no-op callbacks).
 *
 * Supports cleanup callbacks: if a callback ref returns a function, it will be
 * called on unmount (when the ref receives `null`) instead of calling the
 * callback with `null` directly.
 *
 * Vue-specific: automatically unwraps `ComponentPublicInstance` to its root `$el`,
 * since Vue template refs on components return the instance, not the DOM element.
 *
 * @example
 * ```vue
 * <script setup>
 * const internalRef = ref(null)
 * const externalRef = ref(null)
 *
 * const mergedRef = useMergedRefs(internalRef, externalRef)
 * </script>
 *
 * <template>
 *   <div :ref="mergedRef"></div>
 * </template>
 * ```
 */
export function useMergedRefs<T = Element>(...refs: MaybeRef<T>[]) {
  if (refs.every(ref => ref == null)) {
    return undefined
  }

  const cleanupCallbacks: Array<Cleanup | null> = Array.from(
    { length: refs.length },
    () => null,
  )

  return (el: Element | ComponentPublicInstance | null) => {
    // Vue template refs on components return ComponentPublicInstance, not the DOM element.
    // Extract the root element if it's a component instance.
    const instance = (el && '$el' in el ? el.$el : el) as T | null

    if (instance != null) {
      // Mount / update: set all refs and collect cleanup callbacks
      for (let i = 0; i < refs.length; i += 1) {
        const ref = refs[i]
        if (ref == null) {
          continue
        }
        if (typeof ref === 'function') {
          const refCleanup = ref(instance)
          if (typeof refCleanup === 'function') {
            cleanupCallbacks[i] = refCleanup
          }
        }
        else if ('value' in ref) {
          ref.value = instance
        }
      }
    }
    else {
      // Unmount: run cleanups or call with null
      for (let i = 0; i < refs.length; i += 1) {
        const ref = refs[i]
        if (ref == null) {
          continue
        }
        if (typeof ref === 'function') {
          const cleanupCallback = cleanupCallbacks[i]
          if (typeof cleanupCallback === 'function') {
            cleanupCallback()
            cleanupCallbacks[i] = null
          }
          else {
            ref(null)
          }
        }
        else if ('value' in ref) {
          ref.value = null
        }
      }
    }
  }
}
