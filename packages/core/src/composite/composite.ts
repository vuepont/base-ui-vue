import type { Ref } from 'vue'
import { floor } from '@floating-ui/utils'
import { isHTMLElement } from '@floating-ui/utils/dom'

export type TextDirection = 'ltr' | 'rtl'

export interface Dimensions {
  width: number
  height: number
}

export const ARROW_UP = 'ArrowUp'
export const ARROW_DOWN = 'ArrowDown'
export const ARROW_LEFT = 'ArrowLeft'
export const ARROW_RIGHT = 'ArrowRight'
export const HOME = 'Home'
export const END = 'End'

export const HORIZONTAL_KEYS = new Set([ARROW_LEFT, ARROW_RIGHT])
export const HORIZONTAL_KEYS_WITH_EXTRA_KEYS = new Set([
  ARROW_LEFT,
  ARROW_RIGHT,
  HOME,
  END,
])
export const VERTICAL_KEYS = new Set([ARROW_UP, ARROW_DOWN])
export const VERTICAL_KEYS_WITH_EXTRA_KEYS = new Set([
  ARROW_UP,
  ARROW_DOWN,
  HOME,
  END,
])
export const ARROW_KEYS = new Set([...HORIZONTAL_KEYS, ...VERTICAL_KEYS])
export const ALL_KEYS = new Set([...ARROW_KEYS, HOME, END])
export const COMPOSITE_KEYS = new Set([
  ARROW_UP,
  ARROW_DOWN,
  ARROW_LEFT,
  ARROW_RIGHT,
  HOME,
  END,
])

export const SHIFT = 'Shift' as const
export const CONTROL = 'Control' as const
export const ALT = 'Alt' as const
export const META = 'Meta' as const
export const MODIFIER_KEYS = new Set([SHIFT, CONTROL, ALT, META] as const)
export type ModifierKey
  = typeof MODIFIER_KEYS extends Set<infer Keys> ? Keys : never

export function stopEvent(event: Event) {
  event.preventDefault()
  event.stopPropagation()
}

function isInputElement(element: EventTarget): element is HTMLInputElement {
  return isHTMLElement(element) && element.tagName === 'INPUT'
}

export function isNativeInput(
  element: EventTarget,
): element is HTMLElement & (HTMLInputElement | HTMLTextAreaElement) {
  if (isInputElement(element) && element.selectionStart != null) {
    return true
  }
  if (isHTMLElement(element) && element.tagName === 'TEXTAREA') {
    return true
  }
  return false
}

export function scrollIntoViewIfNeeded(
  scrollContainer: HTMLElement | null,
  element: HTMLElement | null,
  direction: TextDirection,
  orientation: 'horizontal' | 'vertical' | 'both',
) {
  if (!scrollContainer || !element || !element.scrollTo) {
    return
  }

  let targetX = scrollContainer.scrollLeft
  let targetY = scrollContainer.scrollTop

  const isOverflowingX
    = scrollContainer.clientWidth < scrollContainer.scrollWidth
  const isOverflowingY
    = scrollContainer.clientHeight < scrollContainer.scrollHeight

  if (isOverflowingX && orientation !== 'vertical') {
    const elementOffsetLeft = getOffset(scrollContainer, element, 'left')
    const containerStyles = getStyles(scrollContainer)
    const elementStyles = getStyles(element)

    if (direction === 'ltr') {
      if (
        elementOffsetLeft
        + element.offsetWidth
        + elementStyles.scrollMarginRight
        > scrollContainer.scrollLeft
        + scrollContainer.clientWidth
        - containerStyles.scrollPaddingRight
      ) {
        // overflow to the right, scroll to align right edges
        targetX
          = elementOffsetLeft
            + element.offsetWidth
            + elementStyles.scrollMarginRight
            - scrollContainer.clientWidth
            + containerStyles.scrollPaddingRight
      }
      else if (
        elementOffsetLeft - elementStyles.scrollMarginLeft
        < scrollContainer.scrollLeft + containerStyles.scrollPaddingLeft
      ) {
        // overflow to the left, scroll to align left edges
        targetX
          = elementOffsetLeft
            - elementStyles.scrollMarginLeft
            - containerStyles.scrollPaddingLeft
      }
    }

    if (direction === 'rtl') {
      if (
        elementOffsetLeft - elementStyles.scrollMarginRight
        < scrollContainer.scrollLeft + containerStyles.scrollPaddingLeft
      ) {
        // overflow to the left, scroll to align left edges
        targetX
          = elementOffsetLeft
            - elementStyles.scrollMarginLeft
            - containerStyles.scrollPaddingLeft
      }
      else if (
        elementOffsetLeft
        + element.offsetWidth
        + elementStyles.scrollMarginRight
        > scrollContainer.scrollLeft
        + scrollContainer.clientWidth
        - containerStyles.scrollPaddingRight
      ) {
        // overflow to the right, scroll to align right edges
        targetX
          = elementOffsetLeft
            + element.offsetWidth
            + elementStyles.scrollMarginRight
            - scrollContainer.clientWidth
            + containerStyles.scrollPaddingRight
      }
    }
  }

  if (isOverflowingY && orientation !== 'horizontal') {
    const elementOffsetTop = getOffset(scrollContainer, element, 'top')
    const containerStyles = getStyles(scrollContainer)
    const elementStyles = getStyles(element)

    if (
      elementOffsetTop - elementStyles.scrollMarginTop
      < scrollContainer.scrollTop + containerStyles.scrollPaddingTop
    ) {
      // overflow upwards, align top edges
      targetY
        = elementOffsetTop
          - elementStyles.scrollMarginTop
          - containerStyles.scrollPaddingTop
    }
    else if (
      elementOffsetTop
      + element.offsetHeight
      + elementStyles.scrollMarginBottom
      > scrollContainer.scrollTop
      + scrollContainer.clientHeight
      - containerStyles.scrollPaddingBottom
    ) {
      // overflow downwards, align bottom edges
      targetY
        = elementOffsetTop
          + element.offsetHeight
          + elementStyles.scrollMarginBottom
          - scrollContainer.clientHeight
          + containerStyles.scrollPaddingBottom
    }
  }

  scrollContainer.scrollTo({
    left: targetX,
    top: targetY,
    behavior: 'auto',
  })
}

function getOffset(
  ancestor: HTMLElement,
  element: HTMLElement,
  side: 'left' | 'top',
) {
  const propName = side === 'left' ? 'offsetLeft' : 'offsetTop'

  let result = 0

  while (element.offsetParent) {
    result += element[propName as keyof HTMLElement] as number
    if (element.offsetParent === ancestor) {
      break
    }
    element = element.offsetParent as HTMLElement
  }

  return result
}

function getStyles(element: HTMLElement) {
  const styles = getComputedStyle(element)
  return {
    scrollMarginTop: Number.parseFloat(styles.scrollMarginTop) || 0,
    scrollMarginRight: Number.parseFloat(styles.scrollMarginRight) || 0,
    scrollMarginBottom: Number.parseFloat(styles.scrollMarginBottom) || 0,
    scrollMarginLeft: Number.parseFloat(styles.scrollMarginLeft) || 0,
    scrollPaddingTop: Number.parseFloat(styles.scrollPaddingTop) || 0,
    scrollPaddingRight: Number.parseFloat(styles.scrollPaddingRight) || 0,
    scrollPaddingBottom: Number.parseFloat(styles.scrollPaddingBottom) || 0,
    scrollPaddingLeft: Number.parseFloat(styles.scrollPaddingLeft) || 0,
  }
}

// ---------------------------------------------------------------------------
// From floating-ui-react
// ---------------------------------------------------------------------------

type DisabledIndices = ReadonlyArray<number> | ((index: number) => boolean)

export function isDifferentGridRow(
  index: number,
  cols: number,
  prevRow: number,
) {
  return Math.floor(index / cols) !== prevRow
}

export function isIndexOutOfListBounds(
  listRef: Ref<Array<HTMLElement | null>>,
  index: number,
) {
  return index < 0 || index >= listRef.value.length
}

export function getMinListIndex(
  listRef: Ref<ReadonlyArray<HTMLElement | null>>,
  disabledIndices?: DisabledIndices | undefined,
) {
  return findNonDisabledListIndex(listRef, { disabledIndices })
}

export function getMaxListIndex(
  listRef: Ref<Array<HTMLElement | null>>,
  disabledIndices?: DisabledIndices | undefined,
) {
  return findNonDisabledListIndex(
    listRef as unknown as Ref<ReadonlyArray<HTMLElement | null>>,
    {
      decrement: true,
      startingIndex: listRef.value.length,
      disabledIndices,
    },
  )
}

export function findNonDisabledListIndex(
  listRef: Ref<ReadonlyArray<HTMLElement | null>>,
  {
    startingIndex = -1,
    decrement = false,
    disabledIndices,
    amount = 1,
  }: {
    startingIndex?: number | undefined
    decrement?: boolean | undefined
    disabledIndices?: DisabledIndices | undefined
    amount?: number | undefined
  } = {},
): number {
  let index = startingIndex
  do {
    index += decrement ? -amount : amount
  } while (
    index >= 0
    && index <= listRef.value.length - 1
    && isListIndexDisabled(listRef, index, disabledIndices)
  )

  return index
}

export function getGridNavigatedIndex(
  listRef: Ref<Array<HTMLElement | null>>,
  {
    event,
    orientation,
    loopFocus,
    rtl,
    cols,
    disabledIndices,
    minIndex,
    maxIndex,
    prevIndex,
    stopEvent: stop = false,
  }: {
    event: KeyboardEvent
    orientation: 'horizontal' | 'vertical' | 'both'
    loopFocus: boolean
    rtl: boolean
    cols: number
    disabledIndices: DisabledIndices | undefined
    minIndex: number
    maxIndex: number
    prevIndex: number
    stopEvent?: boolean | undefined
  },
) {
  let nextIndex = prevIndex

  const rows: number[][] = []
  const rowIndexMap: Record<number, number> = {}
  let hasRoleRow = false
  {
    let currentRowEl: Element | null = null
    let currentRowIndex = -1

    listRef.value.forEach((el, idx) => {
      if (el == null) {
        return
      }
      const rowEl = el.closest('[role="row"]')
      if (rowEl) {
        hasRoleRow = true
      }
      if (rowEl !== currentRowEl || currentRowIndex === -1) {
        currentRowEl = rowEl
        currentRowIndex += 1
        rows[currentRowIndex] = []
      }
      rows[currentRowIndex].push(idx)
      rowIndexMap[idx] = currentRowIndex
    })
  }

  const hasDomRows
    = hasRoleRow && rows.length > 0 && rows.some(row => row.length !== cols)

  function navigateVertically(direction: 'up' | 'down') {
    if (!hasDomRows || prevIndex === -1) {
      return undefined
    }
    const currentRow = rowIndexMap[prevIndex]
    if (currentRow == null) {
      return undefined
    }
    const colInRow = rows[currentRow].indexOf(prevIndex)

    let nextRow = direction === 'up' ? currentRow - 1 : currentRow + 1
    if (loopFocus) {
      if (nextRow < 0) {
        nextRow = rows.length - 1
      }
      else if (nextRow >= rows.length) {
        nextRow = 0
      }
    }

    const visited = new Set<number>()
    const _listRef = listRef as unknown as Ref<
      ReadonlyArray<HTMLElement | null>
    >
    while (nextRow >= 0 && nextRow < rows.length && !visited.has(nextRow)) {
      visited.add(nextRow)
      const targetRow = rows[nextRow]
      if (targetRow.length === 0) {
        nextRow = direction === 'up' ? nextRow - 1 : nextRow + 1
        continue
      }
      const clampedCol = Math.min(colInRow, targetRow.length - 1)
      for (let col = clampedCol; col >= 0; col -= 1) {
        const candidate = targetRow[col]
        if (!isListIndexDisabled(_listRef, candidate, disabledIndices)) {
          return candidate
        }
      }
      nextRow = direction === 'up' ? nextRow - 1 : nextRow + 1

      if (loopFocus) {
        if (nextRow < 0) {
          nextRow = rows.length - 1
        }
        else if (nextRow >= rows.length) {
          nextRow = 0
        }
      }
    }
    return undefined
  }

  const _listRef = listRef as unknown as Ref<ReadonlyArray<HTMLElement | null>>
  if (event.key === ARROW_UP) {
    const domBasedCandidate = navigateVertically('up')
    if (domBasedCandidate !== undefined) {
      if (stop)
        stopEvent(event)
      nextIndex = domBasedCandidate
    }
    else {
      if (stop)
        stopEvent(event)

      if (prevIndex === -1) {
        nextIndex = maxIndex
      }
      else {
        nextIndex = findNonDisabledListIndex(_listRef, {
          startingIndex: nextIndex,
          amount: cols,
          decrement: true,
          disabledIndices,
        })

        if (loopFocus && (prevIndex - cols < minIndex || nextIndex < 0)) {
          const col = prevIndex % cols
          const maxCol = maxIndex % cols
          const offset = maxIndex - (maxCol - col)

          if (maxCol === col) {
            nextIndex = maxIndex
          }
          else {
            nextIndex = maxCol > col ? offset : offset - cols
          }
        }
      }

      if (isIndexOutOfListBounds(listRef, nextIndex)) {
        nextIndex = prevIndex
      }
    }
  }

  if (event.key === ARROW_DOWN) {
    const domBasedCandidate = navigateVertically('down')
    if (domBasedCandidate !== undefined) {
      if (stop)
        stopEvent(event)
      nextIndex = domBasedCandidate
    }
    else {
      if (stop)
        stopEvent(event)

      if (prevIndex === -1) {
        nextIndex = minIndex
      }
      else {
        nextIndex = findNonDisabledListIndex(_listRef, {
          startingIndex: prevIndex,
          amount: cols,
          disabledIndices,
        })

        if (loopFocus && prevIndex + cols > maxIndex) {
          nextIndex = findNonDisabledListIndex(_listRef, {
            startingIndex: (prevIndex % cols) - cols,
            amount: cols,
            disabledIndices,
          })
        }
      }

      if (isIndexOutOfListBounds(listRef, nextIndex)) {
        nextIndex = prevIndex
      }
    }
  }

  if (orientation === 'both') {
    const prevRow = floor(prevIndex / cols)

    if (event.key === (rtl ? ARROW_LEFT : ARROW_RIGHT)) {
      if (stop)
        stopEvent(event)

      if (prevIndex % cols !== cols - 1) {
        nextIndex = findNonDisabledListIndex(_listRef, {
          startingIndex: prevIndex,
          disabledIndices,
        })

        if (loopFocus && isDifferentGridRow(nextIndex, cols, prevRow)) {
          nextIndex = findNonDisabledListIndex(_listRef, {
            startingIndex: prevIndex - (prevIndex % cols) - 1,
            disabledIndices,
          })
        }
      }
      else if (loopFocus) {
        nextIndex = findNonDisabledListIndex(_listRef, {
          startingIndex: prevIndex - (prevIndex % cols) - 1,
          disabledIndices,
        })
      }

      if (isDifferentGridRow(nextIndex, cols, prevRow)) {
        nextIndex = prevIndex
      }
    }

    if (event.key === (rtl ? ARROW_RIGHT : ARROW_LEFT)) {
      if (stop)
        stopEvent(event)

      if (prevIndex % cols !== 0) {
        nextIndex = findNonDisabledListIndex(_listRef, {
          startingIndex: prevIndex,
          decrement: true,
          disabledIndices,
        })

        if (loopFocus && isDifferentGridRow(nextIndex, cols, prevRow)) {
          nextIndex = findNonDisabledListIndex(_listRef, {
            startingIndex: prevIndex + (cols - (prevIndex % cols)),
            decrement: true,
            disabledIndices,
          })
        }
      }
      else if (loopFocus) {
        nextIndex = findNonDisabledListIndex(_listRef, {
          startingIndex: prevIndex + (cols - (prevIndex % cols)),
          decrement: true,
          disabledIndices,
        })
      }

      if (isDifferentGridRow(nextIndex, cols, prevRow)) {
        nextIndex = prevIndex
      }
    }

    const lastRow = floor(maxIndex / cols) === prevRow

    if (isIndexOutOfListBounds(listRef, nextIndex)) {
      if (loopFocus && lastRow) {
        nextIndex
          = event.key === (rtl ? ARROW_RIGHT : ARROW_LEFT)
            ? maxIndex
            : findNonDisabledListIndex(_listRef, {
                startingIndex: prevIndex - (prevIndex % cols) - 1,
                disabledIndices,
              })
      }
      else {
        nextIndex = prevIndex
      }
    }
  }

  return nextIndex
}

export function createGridCellMap(
  sizes: Dimensions[],
  cols: number,
  dense: boolean,
) {
  const cellMap: (number | undefined)[] = []
  let startIndex = 0
  sizes.forEach(({ width, height }, index) => {
    if (width > cols) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error(
          `[Base UI Vue]: Invalid grid - item width at index ${index} is greater than grid columns`,
        )
      }
    }
    let itemPlaced = false
    if (dense) {
      startIndex = 0
    }
    while (!itemPlaced) {
      const targetCells: number[] = []
      for (let i = 0; i < width; i += 1) {
        for (let j = 0; j < height; j += 1) {
          targetCells.push(startIndex + i + j * cols)
        }
      }
      if (
        (startIndex % cols) + width <= cols
        && targetCells.every(cell => cellMap[cell] == null)
      ) {
        targetCells.forEach((cell) => {
          cellMap[cell] = index
        })
        itemPlaced = true
      }
      else {
        startIndex += 1
      }
    }
  })

  return [...cellMap]
}

export function getGridCellIndexOfCorner(
  index: number,
  sizes: Dimensions[],
  cellMap: (number | undefined)[],
  cols: number,
  corner: 'tl' | 'tr' | 'bl' | 'br',
) {
  if (index === -1) {
    return -1
  }

  const firstCellIndex = cellMap.indexOf(index)
  const sizeItem = sizes[index]

  switch (corner) {
    case 'tl':
      return firstCellIndex
    case 'tr':
      if (!sizeItem) {
        return firstCellIndex
      }
      return firstCellIndex + sizeItem.width - 1
    case 'bl':
      if (!sizeItem) {
        return firstCellIndex
      }
      return firstCellIndex + (sizeItem.height - 1) * cols
    case 'br':
      return cellMap.lastIndexOf(index)
    default:
      return -1
  }
}

export function getGridCellIndices(
  indices: (number | undefined)[],
  cellMap: (number | undefined)[],
) {
  return cellMap.flatMap((index, cellIndex) =>
    indices.includes(index) ? [cellIndex] : [],
  )
}

export function isListIndexDisabled(
  listRef: Ref<ReadonlyArray<HTMLElement | null>>,
  index: number,
  disabledIndices?: DisabledIndices,
) {
  if (typeof disabledIndices === 'function') {
    return disabledIndices(index)
  }
  if (disabledIndices) {
    return disabledIndices.includes(index)
  }

  const element = listRef.value[index]
  if (!element) {
    return false
  }

  return (
    element.hasAttribute('disabled')
    || element.getAttribute('aria-disabled') === 'true'
  )
}
