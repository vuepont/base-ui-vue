import type { ComponentPublicInstance, Ref } from 'vue'

type MaybeRef<T> = Ref<T | null> | ((el: T | null) => void) | null | undefined

/**
 * Merges multiple refs or ref callbacks into a single template ref callback.
 * This is useful when you need to bind a DOM element to multiple refs.
 *
 * @example
 * ```vue
 * <script setup>
 * const internalRef = ref(null)
 * const props = defineProps(['externalRef']) // could be ref or function
 *
 * const mergedRef = useMergedRefs(internalRef, () => props.externalRef)
 * </script>
 *
 * <template>
 *   <div :ref="mergedRef"></div>
 * </template>
 * ```
 */
export function useMergedRefs<T = Element>(...refs: MaybeRef<T>[]) {
  return (el: Element | ComponentPublicInstance | null) => {
    // Vue 3 template refs can sometimes pass the component instance instead of the DOM element
    // Extract the element if it's a custom component instance
    const element = (el && '$el' in el ? el.$el : el) as T | null

    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(element)
      }
      else if (ref && 'value' in ref) {
        ref.value = element
      }
    })
  }
}
