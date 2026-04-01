import type { TextDirection } from '../direction-provider/DirectionContext'
import { isHTMLElement } from '@floating-ui/utils/dom'

export {
  createGridCellMap,
  findNonDisabledListIndex,
  getGridCellIndexOfCorner,
  getGridCellIndices,
  getGridNavigatedIndex,
  getMaxListIndex,
  getMinListIndex,
  isIndexOutOfListBounds,
  isListIndexDisabled,
  stopEvent,
} from '../floating-ui-vue/utils'

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
export const PAGE_UP = 'PageUp'
export const PAGE_DOWN = 'PageDown'

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
