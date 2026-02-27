import type { Ref } from 'vue'
import { computed, ref, watchEffect } from 'vue'
import { useCompositeListContext } from './CompositeListContext'

export enum IndexGuessBehavior {
  None,
  GuessFromOrder,
}

export interface UseCompositeListItemParameters<Metadata> {
  index?: () => number | undefined
  label?: () => string | null | undefined
  metadata?: () => Metadata | undefined
  textRef?: () => Ref<HTMLElement | null> | undefined
  /**
   * Enables guessing the indexes. This avoids a re-render after mount, which is useful for
   * large lists. This should be used for lists that are likely flat and vertical, other cases
   * might trigger a re-render anyway.
   */
  indexGuessBehavior?: () => IndexGuessBehavior | undefined
}

export interface UseCompositeListItemReturnValue {
  ref: (node: HTMLElement | null) => void
  index: Readonly<Ref<number>>
}

/**
 * Used to register a list item and its index (DOM position) in the `CompositeList`.
 */
export function useCompositeListItem<Metadata>(
  params: UseCompositeListItemParameters<Metadata> = {},
): UseCompositeListItemReturnValue {
  const externalIndex = computed(() => params.index?.())
  const label = computed(() => params.label?.())
  const metadata = computed(() => params.metadata?.())
  const textRef = computed(() => params.textRef?.())
  const indexGuessBehavior = computed(() => params.indexGuessBehavior?.())

  const {
    register,
    unregister,
    subscribeMapChange,
    elementsRef,
    labelsRef,
    nextIndexRef,
  } = useCompositeListContext()!

  const indexRef = ref(-1)

  function initializeIndex() {
    if (externalIndex.value != null)
      return externalIndex.value
    if (indexGuessBehavior.value === IndexGuessBehavior.GuessFromOrder) {
      if (indexRef.value === -1) {
        const newIndex = nextIndexRef.value
        nextIndexRef.value += 1
        indexRef.value = newIndex
      }
      return indexRef.value
    }
    return -1
  }

  const internalIndex = ref<number>(initializeIndex())
  const index = computed(() => externalIndex.value ?? internalIndex.value)

  const componentRef = ref<Element | null>(null)

  function setRef(node: HTMLElement | null | any) {
    const el = node?.$el || node
    componentRef.value = el

    if (index.value !== -1 && el !== null) {
      elementsRef.value[index.value] = el

      if (labelsRef) {
        const isLabelDefined = label.value !== undefined
        labelsRef.value[index.value] = isLabelDefined
          ? label.value
          : (textRef.value?.value?.textContent ?? el.textContent)
      }
    }
  }

  watchEffect(
    (onCleanup) => {
      if (externalIndex.value != null) {
        return
      }

      const node = componentRef.value
      if (node) {
        register(node, metadata.value as any)
        onCleanup(() => {
          unregister(node)
        })
      }
    },
    { flush: 'post' },
  )

  watchEffect(
    (onCleanup) => {
      if (externalIndex.value != null) {
        return
      }

      const unsubscribe = subscribeMapChange((map) => {
        const i = componentRef.value
          ? map.get(componentRef.value)?.index
          : null

        if (i != null) {
          internalIndex.value = i
        }
      })

      onCleanup(() => {
        unsubscribe()
      })
    },
    { flush: 'post' },
  )

  return {
    ref: setRef,
    index,
  }
}
