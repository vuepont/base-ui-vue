import type { Middleware, MiddlewareState, Padding } from '@floating-ui/vue'
import {
  clamp,
  evaluate,
  getAlignment,
  getAlignmentAxis,
  getAxisLength,
  getPaddingObject,
} from '@floating-ui/utils'

type Derivable<T> = T | ((state: MiddlewareState) => T)

export interface ArrowOptions {
  /**
   * The arrow element to be positioned.
   * @default undefined
   */
  element: Element | null | undefined
  /**
   * The padding between the arrow element and the floating element edges.
   * Useful when the floating element has rounded corners.
   * @default 0
   */
  padding?: Padding
  /**
   * Which element to use as the offset parent.
   * @default 'real'
   */
  offsetParent: 'real' | 'floating'
}

/**
 * Fork of the original `arrow` middleware from Floating UI that allows
 * configuring the offset parent.
 */
export function baseArrow(options: ArrowOptions | Derivable<ArrowOptions>): Middleware {
  return {
    name: 'arrow',
    options,
    async fn(state) {
      const { x, y, placement, rects, platform, elements, middlewareData } = state
      const { element, padding = 0, offsetParent = 'real' } = evaluate(options, state) || {}

      if (element == null) {
        return {}
      }

      const paddingObject = getPaddingObject(padding)
      const coords = { x, y }
      const axis = getAlignmentAxis(placement)
      const length = getAxisLength(axis)
      const arrowDimensions = await platform.getDimensions(element)
      const isYAxis = axis === 'y'
      const minProp = isYAxis ? 'top' : 'left'
      const maxProp = isYAxis ? 'bottom' : 'right'
      const clientProp = isYAxis ? 'clientHeight' : 'clientWidth'

      const endDiff
        = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length]
      const startDiff = coords[axis] - rects.reference[axis]

      const arrowOffsetParent = offsetParent === 'real'
        ? await platform.getOffsetParent?.(element)
        : elements.floating
      let clientSize = 0

      if (arrowOffsetParent && await platform.isElement?.(arrowOffsetParent)) {
        clientSize = arrowOffsetParent[clientProp]
      }

      if (!clientSize) {
        clientSize = elements.floating[clientProp] || rects.floating[length]
      }

      const centerToReference = endDiff / 2 - startDiff / 2
      const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1
      const minPadding = Math.min(paddingObject[minProp], largestPossiblePadding)
      const maxPadding = Math.min(paddingObject[maxProp], largestPossiblePadding)

      const min = minPadding
      const max = clientSize - arrowDimensions[length] - maxPadding
      const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference
      const offset = clamp(min, center, max)

      const shouldAddOffset
        = !middlewareData.arrow
          && getAlignment(placement) != null
          && center !== offset
          && rects.reference[length] / 2
          - (center < min ? minPadding : maxPadding)
          - arrowDimensions[length] / 2
          < 0
      const alignmentOffset = shouldAddOffset ? (center < min ? center - min : center - max) : 0

      return {
        [axis]: coords[axis] + alignmentOffset,
        data: {
          [axis]: offset,
          centerOffset: center - offset - alignmentOffset,
          ...(shouldAddOffset && { alignmentOffset }),
        },
        reset: shouldAddOffset,
      }
    },
  }
}

/**
 * Provides data to position an inner element of the floating element so that it
 * appears centered to the reference element.
 */
export function arrow(options: ArrowOptions | Derivable<ArrowOptions>): Middleware {
  return baseArrow(options)
}
