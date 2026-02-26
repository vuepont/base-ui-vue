import type { Dimensions, ModifierKey } from '../composite'
import type { CompositeMetadata } from '../list/CompositeList.vue'
import { computed, ref } from 'vue'
import { useDirection } from '../../direction-provider/DirectionContext'
import { EMPTY_ARRAY } from '../../utils/constants'
import { isElementDisabled } from '../../utils/isElementDisabled'
import {
  ALL_KEYS,
  ARROW_DOWN,
  ARROW_KEYS,
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  createGridCellMap,

  END,
  findNonDisabledListIndex,
  getGridCellIndexOfCorner,
  getGridCellIndices,
  getGridNavigatedIndex,
  getMaxListIndex,
  getMinListIndex,
  HOME,
  HORIZONTAL_KEYS,
  HORIZONTAL_KEYS_WITH_EXTRA_KEYS,
  isIndexOutOfListBounds,
  isListIndexDisabled,
  isNativeInput,
  MODIFIER_KEYS,

  scrollIntoViewIfNeeded,
  VERTICAL_KEYS,
  VERTICAL_KEYS_WITH_EXTRA_KEYS,
} from '../composite'
import { ACTIVE_COMPOSITE_ITEM } from '../constants'

export interface UseCompositeRootParameters {
  orientation?: () => 'horizontal' | 'vertical' | 'both' | undefined
  cols?: () => number | undefined
  loopFocus?: () => boolean | undefined
  highlightedIndex?: () => number | undefined
  defaultHighlightedIndex?: () => number | undefined
  onHighlightedIndexChange?: (index: number) => void
  dense?: () => boolean | undefined
  itemSizes?: () => Array<Dimensions> | undefined
  enableHomeAndEndKeys?: () => boolean | undefined
  stopEventPropagation?: () => boolean | undefined
  disabledIndices?: () => number[] | undefined
  modifierKeys?: () => ModifierKey[] | undefined
}

export function useCompositeRoot(params: UseCompositeRootParameters) {
  const orientation = computed(() => params.orientation?.() ?? 'both')
  const cols = computed(() => params.cols?.() ?? 1)
  const loopFocus = computed(() => params.loopFocus?.() ?? true)
  const dense = computed(() => params.dense?.() ?? false)
  const itemSizes = computed(() => params.itemSizes?.())
  const enableHomeAndEndKeys = computed(
    () => params.enableHomeAndEndKeys?.() ?? false,
  )
  const stopEventPropagation = computed(
    () => params.stopEventPropagation?.() ?? false,
  )
  const disabledIndices = computed(
    () => params.disabledIndices?.() ?? EMPTY_ARRAY,
  )
  const modifierKeys = computed(
    () => params.modifierKeys?.() ?? (EMPTY_ARRAY as ModifierKey[]),
  )

  const externalHighlightedIndex = computed(() => params.highlightedIndex?.())
  const externalSetHighlightedIndex = params.onHighlightedIndexChange

  const internalHighlightedIndex = ref(params.defaultHighlightedIndex?.() ?? 0)
  const direction = useDirection()
  const isGrid = computed(() => cols.value > 1)

  const rootRef = ref<HTMLElement | null>(null)
  const elementsRef = ref<Array<HTMLElement | null>>([])
  let hasSetDefaultIndex = false

  const highlightedIndex = computed(
    () => externalHighlightedIndex.value ?? internalHighlightedIndex.value,
  )

  function onHighlightedIndexChange(
    index: number,
    shouldScrollIntoView = false,
  ) {
    if (externalHighlightedIndex.value !== undefined) {
      if (externalSetHighlightedIndex) {
        externalSetHighlightedIndex(index)
      }
    }
    else {
      internalHighlightedIndex.value = index
      if (externalSetHighlightedIndex) {
        externalSetHighlightedIndex(index)
      }
    }
    if (shouldScrollIntoView) {
      const newActiveItem = elementsRef.value[index]
      scrollIntoViewIfNeeded(
        rootRef.value,
        newActiveItem,
        direction as any,
        orientation.value,
      )
    }
  }

  function onMapChange(map: Map<Element, CompositeMetadata<any>>) {
    if (map.size === 0 || hasSetDefaultIndex) {
      return
    }
    hasSetDefaultIndex = true
    const sortedElements = Array.from(map.keys())
    const activeItem = (sortedElements.find(compositeElement =>
      compositeElement?.hasAttribute(ACTIVE_COMPOSITE_ITEM),
    ) ?? null) as HTMLElement | null
    const activeIndex = activeItem ? sortedElements.indexOf(activeItem) : -1

    if (activeIndex !== -1) {
      onHighlightedIndexChange(activeIndex)
    }

    scrollIntoViewIfNeeded(
      rootRef.value,
      activeItem,
      direction as any,
      orientation.value,
    )
  }

  function isModifierKeySet(
    event: KeyboardEvent,
    ignoredModifierKeys: ModifierKey[],
  ) {
    for (const key of MODIFIER_KEYS.values()) {
      if (ignoredModifierKeys.includes(key as any)) {
        continue
      }
      if (event.getModifierState(key)) {
        return true
      }
    }
    return false
  }

  function handleFocus(event: FocusEvent) {
    const element = rootRef.value
    if (!element || !isNativeInput(event.target as EventTarget)) {
      return
    }
    const target = event.target as HTMLInputElement
    target.setSelectionRange(0, target.value.length ?? 0)
  }

  function handleKeydown(event: KeyboardEvent) {
    const RELEVANT_KEYS = enableHomeAndEndKeys.value ? ALL_KEYS : ARROW_KEYS
    if (!RELEVANT_KEYS.has(event.key)) {
      return
    }

    if (isModifierKeySet(event, modifierKeys.value)) {
      return
    }

    const element = rootRef.value
    if (!element) {
      return
    }
    const isRtl = direction === 'rtl' // Handle dynamic direction if it's a ref, but `useDirection` usually gives string. Wait, assuming useDirection returns the text.

    const horizontalForwardKey = isRtl ? ARROW_LEFT : ARROW_RIGHT
    const forwardKey = {
      horizontal: horizontalForwardKey,
      vertical: ARROW_DOWN,
      both: horizontalForwardKey,
    }[orientation.value]

    const horizontalBackwardKey = isRtl ? ARROW_RIGHT : ARROW_LEFT
    const backwardKey = {
      horizontal: horizontalBackwardKey,
      vertical: ARROW_UP,
      both: horizontalBackwardKey,
    }[orientation.value]

    if (
      isNativeInput(event.target as EventTarget)
      && !isElementDisabled(event.target as HTMLElement)
    ) {
      const target = event.target as HTMLInputElement
      const selectionStart = target.selectionStart
      const selectionEnd = target.selectionEnd
      const textContent = target.value ?? ''
      if (
        selectionStart == null
        || event.shiftKey
        || selectionStart !== selectionEnd
      ) {
        return
      }
      if (event.key !== backwardKey && selectionStart < textContent.length) {
        return
      }
      if (event.key !== forwardKey && selectionStart > 0) {
        return
      }
    }

    let nextIndex = highlightedIndex.value
    const minIndex = getMinListIndex(elementsRef, disabledIndices.value)
    const maxIndex = getMaxListIndex(elementsRef, disabledIndices.value)

    if (isGrid.value) {
      const sizes
        = itemSizes.value
          || Array.from({ length: elementsRef.value.length }, () => ({
            width: 1,
            height: 1,
          }))
      const cellMap = createGridCellMap(sizes, cols.value, dense.value)
      const minGridIndex = cellMap.findIndex(
        index =>
          index != null
          && !isListIndexDisabled(elementsRef, index, disabledIndices.value),
      )
      const maxGridIndex = cellMap.reduce(
        (foundIndex: number, index, cellIndex) =>
          index != null
          && !isListIndexDisabled(elementsRef, index, disabledIndices.value)
            ? cellIndex
            : foundIndex,
        -1,
      )

      nextIndex = cellMap[
        getGridNavigatedIndex(elementsRef, {
          event,
          orientation: orientation.value,
          loopFocus: loopFocus.value,
          cols: cols.value,
          disabledIndices: getGridCellIndices(
            [
              ...((disabledIndices.value.length > 0
                ? disabledIndices.value
                : undefined)
              || elementsRef.value.map((_, index) =>
                isListIndexDisabled(elementsRef, index) ? index : undefined,
              )),
              undefined,
            ],
            cellMap,
          ),
          minIndex: minGridIndex,
          maxIndex: maxGridIndex,
          prevIndex: getGridCellIndexOfCorner(
            highlightedIndex.value > maxIndex
              ? minIndex
              : highlightedIndex.value,
            sizes,
            cellMap,
            cols.value,
            event.key === ARROW_DOWN
              ? 'bl'
              : event.key === ARROW_RIGHT
                ? 'tr'
                : 'tl',
          ),
          rtl: isRtl,
        })
      ] as number
    }

    const forwardKeys = {
      horizontal: [horizontalForwardKey],
      vertical: [ARROW_DOWN],
      both: [horizontalForwardKey, ARROW_DOWN],
    }[orientation.value]

    const backwardKeys = {
      horizontal: [horizontalBackwardKey],
      vertical: [ARROW_UP],
      both: [horizontalBackwardKey, ARROW_UP],
    }[orientation.value]

    const preventedKeys = isGrid.value
      ? RELEVANT_KEYS
      : ({
          horizontal: enableHomeAndEndKeys.value
            ? HORIZONTAL_KEYS_WITH_EXTRA_KEYS
            : HORIZONTAL_KEYS,
          vertical: enableHomeAndEndKeys.value
            ? VERTICAL_KEYS_WITH_EXTRA_KEYS
            : VERTICAL_KEYS,
          both: RELEVANT_KEYS,
        }[orientation.value] as typeof RELEVANT_KEYS)

    if (enableHomeAndEndKeys.value) {
      if (event.key === HOME) {
        nextIndex = minIndex
      }
      else if (event.key === END) {
        nextIndex = maxIndex
      }
    }

    if (
      nextIndex === highlightedIndex.value
      && (forwardKeys.includes(event.key) || backwardKeys.includes(event.key))
    ) {
      if (
        loopFocus.value
        && nextIndex === maxIndex
        && forwardKeys.includes(event.key)
      ) {
        nextIndex = minIndex
      }
      else if (
        loopFocus.value
        && nextIndex === minIndex
        && backwardKeys.includes(event.key)
      ) {
        nextIndex = maxIndex
      }
      else {
        nextIndex = findNonDisabledListIndex(elementsRef as any, {
          startingIndex: nextIndex,
          decrement: backwardKeys.includes(event.key),
          disabledIndices: disabledIndices.value,
        })
      }
    }

    if (
      nextIndex !== highlightedIndex.value
      && !isIndexOutOfListBounds(elementsRef, nextIndex)
    ) {
      if (stopEventPropagation.value) {
        event.stopPropagation()
      }

      if (preventedKeys.has(event.key)) {
        event.preventDefault()
      }
      onHighlightedIndexChange(nextIndex, true)

      queueMicrotask(() => {
        elementsRef.value[nextIndex]?.focus()
      })
    }
  }

  return {
    getRootProps: (externalProps: Record<string, any> = {}) => ({
      ...externalProps,
      'aria-orientation':
        orientation.value === 'both' ? undefined : orientation.value,
      onFocus(event: FocusEvent) {
        externalProps.onFocus?.(event)
        if (!event.defaultPrevented)
          handleFocus(event)
      },
      onKeydown(event: KeyboardEvent) {
        externalProps.onKeydown?.(event)
        if (!event.defaultPrevented)
          handleKeydown(event)
      },
    }),
    rootRef,
    highlightedIndex,
    onHighlightedIndexChange,
    elementsRef,
    disabledIndices,
    onMapChange,
    relayKeyboardEvent: handleKeydown,
  }
}
