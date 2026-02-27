import type { HTMLProps } from '../../utils/types'
import type { UseCompositeListItemParameters } from '../list/useCompositeListItem'
import { computed, ref, watch } from 'vue'
import { useMergedRefs } from '../../../../plugins/src/useMergedRefs'
import { useCompositeListItem } from '../list/useCompositeListItem'
import { useCompositeRootContext } from '../root/CompositeRootContext'

export interface UseCompositeItemParameters<Metadata> extends Pick<
  UseCompositeListItemParameters<Metadata>,
  'metadata' | 'indexGuessBehavior'
> {}

export function useCompositeItem<Metadata>(
  params: UseCompositeItemParameters<Metadata> = {},
) {
  const context = useCompositeRootContext()

  const { ref: listItemRef, index } = useCompositeListItem(params)

  const isHighlighted = computed(
    () => context.highlightedIndex === index.value,
  )

  const itemRef = ref<HTMLElement | null>(null)
  const mergedRef = useMergedRefs(listItemRef, itemRef)

  // When the index changes from -1 to a valid value, if this item
  // currently has DOM focus, update the highlighted index.
  // This handles the case where focus() is called before items are registered.
  watch(index, (newIndex, oldIndex) => {
    if (oldIndex === -1 && newIndex !== -1 && itemRef.value) {
      if (document.activeElement === itemRef.value) {
        context.onHighlightedIndexChange(newIndex)
      }
    }
  })

  const compositeProps = computed<HTMLProps>(() => ({
    tabindex: isHighlighted.value ? 0 : -1,
    onFocus() {
      context.onHighlightedIndexChange(index.value)
    },
    onMousemove() {
      const item = itemRef.value
      if (!context.highlightItemOnHover || !item) {
        return
      }

      const disabled
        = item.hasAttribute('disabled')
          || item.getAttribute('aria-disabled') === 'true'
      if (!isHighlighted.value && !disabled) {
        item.focus()
      }
    },
  }))

  return {
    compositeProps,
    compositeRef: mergedRef,
    index,
  }
}
