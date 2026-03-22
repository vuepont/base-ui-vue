import type { Ref } from 'vue'
import type { TextDirection } from '../../direction-provider/DirectionContext'
import type { HTMLProps } from '../../types'
import type { Dimensions, ModifierKey } from '../composite'
import type { CompositeMetadata } from '../list/CompositeList.vue'
import { computed, ref } from 'vue'
import { isElementDisabled } from '../../utils/isElementDisabled'
import { useMergedRefs } from '../../utils/useMergedRefs'
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
  direction: () => TextDirection
  itemSizes?: () => Array<Dimensions> | undefined
  rootRef?: Ref<HTMLElement | null>
  /**
   * When `true`, pressing the Home key moves focus to the first item,
   * and pressing the End key moves focus to the last item.
   * @default false
   */
  enableHomeAndEndKeys?: () => boolean | undefined
  /**
   * When `true`, keypress events on Composite's navigation keys
   * be stopped with event.stopPropagation().
   * @default false
   */
  stopEventPropagation?: () => boolean | undefined
  /**
   * Array of item indices to be considered disabled.
   * Used for composite items that are focusable when disabled.
   */
  disabledIndices?: () => number[] | undefined
  /**
   * Array of [modifier key values](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values#modifier_keys) that should allow normal keyboard actions
   * when pressed. By default, all modifier keys prevent normal actions.
   * @default []
   */
  modifierKeys?: () => ModifierKey[] | undefined
}

const EMPTY_ARRAY: never[] = []

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
  const isGrid = computed(() => cols.value > 1)

  const rootRef = ref<HTMLElement | null>(null)
  const mergedRef = useMergedRefs(rootRef, params.rootRef)
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
        params.direction(),
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
    // Set the default highlighted index of an arbitrary composite item.
    const activeIndex = activeItem ? sortedElements.indexOf(activeItem) : -1

    if (activeIndex !== -1) {
      onHighlightedIndexChange(activeIndex)
    }

    scrollIntoViewIfNeeded(
      rootRef.value,
      activeItem,
      params.direction(),
      orientation.value,
    )
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
    const isRtl = params.direction() === 'rtl'

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
      // return to native textbox behavior when
      // 1 - Shift is held to make a text selection, or if there already is a text selection
      if (
        selectionStart == null
        || event.shiftKey
        || selectionStart !== selectionEnd
      ) {
        return
      }
      // 2 - arrow-ing forward and not in the last position of the text
      if (event.key !== backwardKey && selectionStart < textContent.length) {
        return
      }
      // 3 - arrow-ing backward and not in the first position of the text
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
      // To calculate movements on the grid, we use hypothetical cell indices
      // as if every item was 1x1, then convert back to real indices.
      const cellMap = createGridCellMap(sizes, cols.value, dense.value)
      const minGridIndex = cellMap.findIndex(
        index =>
          index != null
          && !isListIndexDisabled(elementsRef, index, disabledIndices.value),
      )
      // last enabled index
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
          // treat undefined (empty grid spaces) as disabled indices so we
          // don't end up in them
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
            // use a corner matching the edge closest to the direction we're
            // moving in so we don't end up in the same item. Prefer
            // top/left over bottom/right.

            event.key === ARROW_DOWN
              ? 'bl'
              : event.key === ARROW_RIGHT
                ? 'tr'
                : 'tl',
          ),
          rtl: isRtl,
        })
      ] as number // navigated cell will never be nullish
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

      // Wait for FocusManager `returnFocus` to execute.
      queueMicrotask(() => {
        elementsRef.value[nextIndex]?.focus()
      })
    }
  }

  return {
    getRootProps: (externalProps: Record<string, any> = {}): HTMLProps => ({
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
    mergedRef,
    highlightedIndex,
    onHighlightedIndexChange,
    elementsRef,
    disabledIndices,
    onMapChange,
    relayKeyboardEvent: handleKeydown,
  }
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
