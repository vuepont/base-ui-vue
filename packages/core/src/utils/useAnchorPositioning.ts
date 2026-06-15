import type { Rect } from '@floating-ui/utils'
import type { ComputedRef, CSSProperties, MaybeRefOrGetter, Ref, ShallowRef } from 'vue'
import type {
  AutoUpdateOptions,
  Boundary as FloatingBoundary,
  Middleware,
  MiddlewareState,
  Padding,
  Side as PhysicalSide,
  Placement,
  Strategy,
  VirtualElement,
} from '../floating-ui-vue'
import {
  getAlignment,
  getSide,
  getSideAxis,
} from '@floating-ui/utils'
import { computed, shallowRef, toValue, watchEffect } from 'vue'
import { useDirection } from '../direction-provider/DirectionContext'
import {
  autoUpdate,
  flip,
  limitShift,
  offset,
  shift,
  size,
  useFloating,
} from '../floating-ui-vue'
import { arrow } from '../floating-ui-vue/middleware/arrow'
import { DEFAULT_SIDES } from './adaptiveOriginMiddleware'
import { hide } from './hideMiddleware'
import { ownerDocument, ownerWindow } from './owner'

export type Side = 'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start'
export type Align = 'start' | 'center' | 'end'
export type Boundary = 'clipping-ancestors' | Element | Element[] | Rect
export type OffsetFunction = (data: {
  side: Side
  align: Align
  anchor: { width: number, height: number }
  positioner: { width: number, height: number }
}) => number

interface SideFlipMode {
  /**
   * How to avoid collisions on the side axis.
   * - `'flip'`: If there is not enough space, place the popup on the opposite side.
   * - `'none'`: Keep the preferred side even if it overflows.
   */
  side?: 'flip' | 'none'
  /**
   * How to avoid collisions on the align axis.
   * - `'flip'`: If there is not enough space, swap `'start'` and `'end'` alignment.
   * - `'shift'`: Keep the alignment and shift the popup to fit within the boundary.
   * - `'none'`: Keep the preferred alignment even if it overflows.
   */
  align?: 'flip' | 'shift' | 'none'
  /**
   * If both sides on the preferred axis do not fit, determines whether to fallback
   * to a side on the perpendicular axis and which logical side to prefer.
   * - `'start'`: Prefer the logical start side on the perpendicular axis.
   * - `'end'`: Prefer the logical end side on the perpendicular axis.
   * - `'none'`: Do not fallback to the perpendicular axis.
   */
  fallbackAxisSide?: 'start' | 'end' | 'none'
}

interface SideShiftMode {
  /**
   * How to avoid collisions on the side axis.
   * - `'shift'`: Keep the preferred side and shift the popup to fit within the boundary.
   * - `'none'`: Keep the preferred side even if it overflows.
   */
  side?: 'shift' | 'none'
  /**
   * How to avoid collisions on the align axis.
   * - `'shift'`: Keep the alignment and shift the popup to fit within the boundary.
   * - `'none'`: Keep the preferred alignment even if it overflows.
   */
  align?: 'shift' | 'none'
  /**
   * If both sides on the preferred axis do not fit, determines whether to fallback
   * to a side on the perpendicular axis and which logical side to prefer.
   * - `'start'`: Prefer the logical start side on the perpendicular axis.
   * - `'end'`: Prefer the logical end side on the perpendicular axis.
   * - `'none'`: Do not fallback to the perpendicular axis.
   */
  fallbackAxisSide?: 'start' | 'end' | 'none'
}

export type CollisionAvoidance = SideFlipMode | SideShiftMode

/**
 * Used by regular popups that usually aren't scrollable and are allowed to
 * freely flip to any axis of placement.
 */
export const POPUP_COLLISION_AVOIDANCE: CollisionAvoidance = {
  fallbackAxisSide: 'end',
}

/**
 * Used for dropdowns that usually strictly prefer top/bottom placements and
 * use `var(--available-height)` to limit their height.
 */
export const DROPDOWN_COLLISION_AVOIDANCE: CollisionAvoidance = {
  fallbackAxisSide: 'none',
}

export interface UseAnchorPositioningSharedParameters {
  /**
   * An element to position the popup against.
   * By default, the popup will be positioned against the trigger.
   */
  anchor?: MaybeRefOrGetter<Element | VirtualElement | null | undefined>
  /**
   * Determines which CSS `position` property to use.
   * @default 'absolute'
   */
  positionMethod?: MaybeRefOrGetter<Strategy | undefined>
  /**
   * Which side of the anchor element to align the popup against.
   * May automatically change to avoid collisions.
   * @default 'bottom'
   */
  side?: MaybeRefOrGetter<Side | undefined>
  /**
   * Distance between the anchor and the popup in pixels.
   * Also accepts a function that returns the distance to read the dimensions of the anchor
   * and positioner elements, along with its side and alignment.
   *
   * The function takes a `data` object parameter with the following properties:
   * - `data.anchor`: the dimensions of the anchor element with properties `width` and `height`.
   * - `data.positioner`: the dimensions of the positioner element with properties `width` and `height`.
   * - `data.side`: which side of the anchor element the positioner is aligned against.
   * - `data.align`: how the positioner is aligned relative to the specified side.
   *
   * @example
   * ```vue
   * <TooltipPositioner
   *   :side-offset="({ side, anchor }) => side === 'top' ? anchor.height : 0"
   * />
   * ```
   *
   * @default 0
   */
  sideOffset?: MaybeRefOrGetter<number | OffsetFunction | undefined>
  /**
   * How to align the popup relative to the specified side.
   * @default 'center'
   */
  align?: MaybeRefOrGetter<Align | undefined>
  /**
   * Additional offset along the alignment axis in pixels.
   * Also accepts a function that returns the offset to read the dimensions of the anchor
   * and positioner elements, along with its side and alignment.
   *
   * The function takes a `data` object parameter with the following properties:
   * - `data.anchor`: the dimensions of the anchor element with properties `width` and `height`.
   * - `data.positioner`: the dimensions of the positioner element with properties `width` and `height`.
   * - `data.side`: which side of the anchor element the positioner is aligned against.
   * - `data.align`: how the positioner is aligned relative to the specified side.
   *
   * @example
   * ```vue
   * <TooltipPositioner
   *   :align-offset="({ align, positioner }) => align === 'start' ? positioner.width : 0"
   * />
   * ```
   *
   * @default 0
   */
  alignOffset?: MaybeRefOrGetter<number | OffsetFunction | undefined>
  /**
   * An element or a rectangle that delimits the area that the popup is confined to.
   * @default 'clipping-ancestors'
   */
  collisionBoundary?: MaybeRefOrGetter<Boundary | undefined>
  /**
   * Additional space to maintain from the edge of the collision boundary.
   * @default 5
   */
  collisionPadding?: MaybeRefOrGetter<Padding | undefined>
  /**
   * Whether to maintain the popup in the viewport after
   * the anchor element was scrolled out of view.
   * @default false
   */
  sticky?: MaybeRefOrGetter<boolean | undefined>
  /**
   * Minimum distance to maintain between the arrow and the edges of the popup.
   *
   * Use it to prevent the arrow element from hanging out of the rounded corners of a popup.
   * @default 5
   */
  arrowPadding?: MaybeRefOrGetter<Padding | undefined>
  /**
   * Whether to disable the popup from tracking any layout shift of its positioning anchor.
   * @default false
   */
  disableAnchorTracking?: MaybeRefOrGetter<boolean | undefined>
  /**
   * Determines how to handle collisions when positioning the popup.
   */
  collisionAvoidance?: MaybeRefOrGetter<CollisionAvoidance | undefined>
}

export interface UseAnchorPositioningParameters extends UseAnchorPositioningSharedParameters {
  keepMounted?: MaybeRefOrGetter<boolean | undefined>
  mounted: MaybeRefOrGetter<boolean>
  shiftCrossAxis?: MaybeRefOrGetter<boolean | undefined>
  lazyFlip?: MaybeRefOrGetter<boolean | undefined>
  adaptiveOrigin?: MaybeRefOrGetter<Middleware | undefined>
  autoUpdateOptions?: MaybeRefOrGetter<Partial<AutoUpdateOptions> | undefined>
  positionerSizeVars?: MaybeRefOrGetter<boolean | undefined>
  /**
   * Optional middleware that can replace the measured reference rect before offsets and collision
   * middleware run.
   */
  inline?: MaybeRefOrGetter<Middleware | undefined>
}

export interface UseAnchorPositioningReturnValue {
  positionerRef: ShallowRef<HTMLElement | null>
  positionerStyles: ComputedRef<CSSProperties>
  arrowStyles: ComputedRef<CSSProperties>
  arrowRef: Ref<HTMLElement | null>
  arrowUncentered: ComputedRef<boolean>
  side: ComputedRef<Side>
  align: ComputedRef<Align>
  physicalSide: ComputedRef<PhysicalSide>
  anchorHidden: ComputedRef<boolean>
  isPositioned: ComputedRef<boolean>
  update: () => void
}

/**
 * Provides standardized anchor positioning behavior for floating elements.
 * Wraps Floating UI's Vue `useFloating` composable.
 */
export function useAnchorPositioning(
  params: UseAnchorPositioningParameters,
): UseAnchorPositioningReturnValue {
  const direction = useDirection()
  const isRtl = computed(() => direction.value === 'rtl')
  const mounted = computed(() => toValue(params.mounted))
  const keepMounted = computed(() => toValue(params.keepMounted) ?? false)
  const sideParam = computed(() => toValue(params.side) ?? 'bottom')
  const alignParam = computed(() => toValue(params.align) ?? 'center')
  const positionMethod = computed(() => toValue(params.positionMethod) ?? 'absolute')
  const adaptiveOriginMiddleware = computed(() => toValue(params.adaptiveOrigin))
  const positionerSizeVars = computed(() => toValue(params.positionerSizeVars) ?? true)
  const collisionAvoidance = computed(() =>
    toValue(params.collisionAvoidance) ?? POPUP_COLLISION_AVOIDANCE,
  )

  const mountSide = shallowRef<PhysicalSide | null>(null)
  const positionerRef = shallowRef<HTMLElement | null>(null)
  const arrowRef = shallowRef<HTMLElement | null>(null)
  const transformOrigin = shallowRef<string | undefined>(undefined)
  const sizeData = shallowRef<{
    availableWidth?: number
    availableHeight?: number
    anchorWidth?: number
    anchorHeight?: number
    positionerWidth?: number
    positionerHeight?: number
  }>({})

  watchEffect(() => {
    if (!mounted.value && mountSide.value !== null) {
      mountSide.value = null
    }
  })

  const requestedPhysicalSide = computed<PhysicalSide>(() =>
    mountSide.value ?? getPhysicalSide(sideParam.value, isRtl.value),
  )

  const placement = computed<Placement>(() => {
    if (alignParam.value === 'center') {
      return requestedPhysicalSide.value
    }

    return `${requestedPhysicalSide.value}-${alignParam.value}` as Placement
  })

  const reference = computed(() => toValue(params.anchor) ?? null)

  const collisionPadding = computed(() =>
    normalizeCollisionPadding(toValue(params.collisionPadding) ?? 5, sideParam.value),
  )

  const commonCollisionProps = computed(() => ({
    boundary: getFloatingBoundary(toValue(params.collisionBoundary)),
    padding: collisionPadding.value,
  }))

  const autoUpdateOptions = computed<AutoUpdateOptions>(() => ({
    elementResize:
      !toValue(params.disableAnchorTracking) && typeof ResizeObserver !== 'undefined',
    layoutShift:
      !toValue(params.disableAnchorTracking) && typeof IntersectionObserver !== 'undefined',
    ...toValue(params.autoUpdateOptions),
  }))

  const middleware = computed<Middleware[]>(() => {
    const sideOffset = toValue(params.sideOffset) ?? 0
    const alignOffset = toValue(params.alignOffset) ?? 0
    const arrowPadding = toValue(params.arrowPadding) ?? 5
    const sticky = toValue(params.sticky) ?? false
    const shiftCrossAxis = toValue(params.shiftCrossAxis) ?? false
    const avoidance = collisionAvoidance.value
    const collisionAvoidanceSide = avoidance.side ?? 'flip'
    const collisionAvoidanceAlign = avoidance.align ?? 'flip'
    const collisionAvoidanceFallbackAxisSide = avoidance.fallbackAxisSide ?? 'end'
    const shiftDisabled
      = collisionAvoidanceAlign === 'none' && collisionAvoidanceSide !== 'shift'
    const crossAxisShiftEnabled
      = !shiftDisabled && (sticky || shiftCrossAxis || collisionAvoidanceSide === 'shift')

    const flipMiddleware = collisionAvoidanceSide === 'none'
      ? null
      : flip({
          ...commonCollisionProps.value,
          padding: expandCollisionPadding(collisionPadding.value, 1),
          mainAxis: !shiftCrossAxis && collisionAvoidanceSide === 'flip',
          crossAxis: collisionAvoidanceAlign === 'flip' ? 'alignment' : false,
          fallbackAxisSideDirection: collisionAvoidanceFallbackAxisSide,
        })

    const shiftMiddleware = shiftDisabled
      ? null
      : shift((data) => {
          const html = ownerDocument(data.elements.floating)?.documentElement

          return {
            ...commonCollisionProps.value,
            rootBoundary: shiftCrossAxis && html
              ? { x: 0, y: 0, width: html.clientWidth, height: html.clientHeight }
              : undefined,
            mainAxis: collisionAvoidanceAlign !== 'none',
            crossAxis: crossAxisShiftEnabled,
            limiter: sticky || shiftCrossAxis
              ? undefined
              : limitShift((limitData) => {
                  if (!arrowRef.value) {
                    return {}
                  }

                  const { width, height } = arrowRef.value.getBoundingClientRect()
                  const sideAxis = getSideAxis(getSide(limitData.placement))
                  const arrowSize = sideAxis === 'y' ? width : height
                  const offsetAmount = sideAxis === 'y'
                    ? collisionPadding.value.left + collisionPadding.value.right
                    : collisionPadding.value.top + collisionPadding.value.bottom

                  return {
                    offset: arrowSize / 2 + offsetAmount / 2,
                  }
                }),
          }
        })

    const middlewareItems: Array<Middleware | null | undefined> = [
      toValue(params.inline),
      offset((state) => {
        const data = getOffsetData(state, sideParam.value, isRtl.value)
        const sideAxis = typeof sideOffset === 'function' ? sideOffset(data) : sideOffset
        const alignAxis = typeof alignOffset === 'function' ? alignOffset(data) : alignOffset

        return {
          mainAxis: sideAxis,
          crossAxis: alignAxis,
          alignmentAxis: alignAxis,
        }
      }),
    ]

    if (
      collisionAvoidanceSide === 'shift'
      || collisionAvoidanceAlign === 'shift'
      || alignParam.value === 'center'
    ) {
      middlewareItems.push(shiftMiddleware, flipMiddleware)
    }
    else {
      middlewareItems.push(flipMiddleware, shiftMiddleware)
    }

    middlewareItems.push(
      size({
        ...commonCollisionProps.value,
        apply({ elements: { floating }, availableWidth, availableHeight, rects }) {
          if (!mounted.value) {
            return
          }

          const dpr = ownerWindow(floating).devicePixelRatio || 1
          const { x, y, width, height } = rects.reference
          const anchorWidth = (Math.round((x + width) * dpr) - Math.round(x * dpr)) / dpr
          const anchorHeight = (Math.round((y + height) * dpr) - Math.round(y * dpr)) / dpr

          sizeData.value = {
            availableWidth,
            availableHeight,
            anchorWidth,
            anchorHeight,
            positionerWidth: rects.floating.width,
            positionerHeight: rects.floating.height,
          }
        },
      }),
      arrow(() => ({
        element:
          arrowRef.value
          || ownerDocument(positionerRef.value)?.createElement('div')
          || undefined,
        padding: arrowPadding,
        offsetParent: 'floating',
      })),
      {
        name: 'transformOrigin',
        fn(state) {
          const { elements, middlewareData, placement: renderedPlacement, rects, y } = state
          const currentRenderedSide = getSide(renderedPlacement)
          const currentRenderedAxis = getSideAxis(currentRenderedSide)
          const arrowEl = arrowRef.value
          const arrowX = middlewareData.arrow?.x || 0
          const arrowY = middlewareData.arrow?.y || 0
          const arrowWidth = arrowEl?.clientWidth || 0
          const arrowHeight = arrowEl?.clientHeight || 0
          const transformX = arrowX + arrowWidth / 2
          const transformY = arrowY + arrowHeight / 2
          const shiftY = Math.abs(middlewareData.shift?.y || 0)
          const halfAnchorHeight = rects.reference.height / 2
          const sideOffsetValue = typeof sideOffset === 'function'
            ? sideOffset(getOffsetData(state, sideParam.value, isRtl.value))
            : sideOffset
          const isOverlappingAnchor = shiftY > sideOffsetValue

          const adjacentTransformOrigin = {
            top: `${transformX}px calc(100% + ${sideOffsetValue}px)`,
            bottom: `${transformX}px ${-sideOffsetValue}px`,
            left: `calc(100% + ${sideOffsetValue}px) ${transformY}px`,
            right: `${-sideOffsetValue}px ${transformY}px`,
          }[currentRenderedSide]
          const overlapTransformOrigin
            = `${transformX}px ${rects.reference.y + halfAnchorHeight - y}px`

          transformOrigin.value
            = crossAxisShiftEnabled && currentRenderedAxis === 'y' && isOverlappingAnchor
              ? overlapTransformOrigin
              : adjacentTransformOrigin

          elements.floating.style.setProperty('--transform-origin', transformOrigin.value)

          return {}
        },
      },
      hide,
      toValue(params.adaptiveOrigin),
    )

    return middlewareItems.filter((item): item is Middleware => item != null)
  })

  const floating = useFloating(reference, positionerRef, {
    open: () => keepMounted.value ? mounted.value : undefined,
    placement,
    strategy: positionMethod,
    middleware,
    transform: () => adaptiveOriginMiddleware.value == null,
    whileElementsMounted(referenceEl, floatingEl, update) {
      return autoUpdate(referenceEl, floatingEl, update, autoUpdateOptions.value)
    },
  })

  const renderedPhysicalSide = computed(() => getSide(floating.placement.value))
  const side = computed<Side>(() =>
    getLogicalSide(sideParam.value, renderedPhysicalSide.value, isRtl.value),
  )
  const align = computed<Align>(() =>
    (getAlignment(floating.placement.value) as Align | undefined) ?? 'center',
  )
  const anchorHidden = computed(() =>
    Boolean(floating.middlewareData.value.hide?.referenceHidden),
  )
  const arrowStyles = computed<CSSProperties>(() => ({
    position: 'absolute',
    left: toCssPixel(floating.middlewareData.value.arrow?.x),
    top: toCssPixel(floating.middlewareData.value.arrow?.y),
  }))
  const arrowUncentered = computed(() => {
    const centerOffset = floating.middlewareData.value.arrow?.centerOffset
    return typeof centerOffset === 'number' && centerOffset !== 0
  })
  const resolvedPosition = computed<Strategy>(() =>
    floating.isPositioned.value ? positionMethod.value : 'fixed',
  )
  const positionerStyles = computed<CSSProperties>(() => {
    const adaptiveOriginData = floating.middlewareData.value.adaptiveOrigin as
      | typeof DEFAULT_SIDES
      | undefined
    const { sideX, sideY } = adaptiveOriginData || DEFAULT_SIDES
    const baseStyles: CSSProperties = adaptiveOriginMiddleware.value
      ? {
          position: resolvedPosition.value,
          [sideX]: toCssPixel(floating.x.value),
          [sideY]: toCssPixel(floating.y.value),
        }
      : {
          ...floating.floatingStyles.value,
          position: resolvedPosition.value,
        }

    const styles: CSSProperties = {
      ...baseStyles,
      '--available-width': toCssPixel(sizeData.value.availableWidth),
      '--available-height': toCssPixel(sizeData.value.availableHeight),
      '--anchor-width': toCssPixel(sizeData.value.anchorWidth),
      '--anchor-height': toCssPixel(sizeData.value.anchorHeight),
      '--transform-origin': transformOrigin.value,
    }

    if (positionerSizeVars.value) {
      styles['--positioner-width'] = toCssPixel(sizeData.value.positionerWidth)
      styles['--positioner-height'] = toCssPixel(sizeData.value.positionerHeight)
    }

    if (!floating.isPositioned.value) {
      styles.opacity = 0
    }

    return styles
  })

  watchEffect(() => {
    if (!toValue(params.lazyFlip) || !mounted.value || !floating.isPositioned.value) {
      return
    }

    if (mountSide.value !== renderedPhysicalSide.value) {
      mountSide.value = renderedPhysicalSide.value
    }
  })

  return {
    positionerRef,
    positionerStyles,
    arrowStyles,
    arrowRef,
    arrowUncentered,
    side,
    align,
    physicalSide: renderedPhysicalSide,
    anchorHidden,
    isPositioned: computed(() => floating.isPositioned.value),
    update: floating.update,
  }
}

function getLogicalSide(sideParam: Side, renderedSide: PhysicalSide, isRtl: boolean): Side {
  const isLogicalSideParam = sideParam === 'inline-start' || sideParam === 'inline-end'
  const logicalRight = isRtl ? 'inline-start' : 'inline-end'
  const logicalLeft = isRtl ? 'inline-end' : 'inline-start'

  return {
    top: 'top',
    right: isLogicalSideParam ? logicalRight : 'right',
    bottom: 'bottom',
    left: isLogicalSideParam ? logicalLeft : 'left',
  }[renderedSide] as Side
}

function getPhysicalSide(side: Side, isRtl: boolean): PhysicalSide {
  return {
    'top': 'top',
    'right': 'right',
    'bottom': 'bottom',
    'left': 'left',
    'inline-end': isRtl ? 'left' : 'right',
    'inline-start': isRtl ? 'right' : 'left',
  }[side] as PhysicalSide
}

function getOffsetData(state: MiddlewareState, sideParam: Side, isRtl: boolean) {
  const { rects, placement } = state

  return {
    side: getLogicalSide(sideParam, getSide(placement), isRtl),
    align: (getAlignment(placement) as Align | undefined) ?? 'center',
    anchor: { width: rects.reference.width, height: rects.reference.height },
    positioner: { width: rects.floating.width, height: rects.floating.height },
  } as const
}

function normalizeCollisionPadding(padding: Padding, sideParam: Side) {
  const bias = 1
  const biasTop = sideParam === 'bottom' ? bias : 0
  const biasBottom = sideParam === 'top' ? bias : 0
  const biasLeft = sideParam === 'right' ? bias : 0
  const biasRight = sideParam === 'left' ? bias : 0

  if (typeof padding === 'number') {
    return {
      top: padding + biasTop,
      right: padding + biasRight,
      bottom: padding + biasBottom,
      left: padding + biasLeft,
    }
  }

  return {
    top: (padding.top || 0) + biasTop,
    right: (padding.right || 0) + biasRight,
    bottom: (padding.bottom || 0) + biasBottom,
    left: (padding.left || 0) + biasLeft,
  }
}

function expandCollisionPadding(
  padding: ReturnType<typeof normalizeCollisionPadding>,
  amount: number,
) {
  return {
    top: padding.top + amount,
    right: padding.right + amount,
    bottom: padding.bottom + amount,
    left: padding.left + amount,
  }
}

function getFloatingBoundary(boundary: Boundary | undefined): FloatingBoundary | undefined {
  if (boundary === 'clipping-ancestors') {
    return 'clippingAncestors'
  }

  return boundary
}

function toCssPixel(value: number | undefined) {
  return value === undefined ? undefined : `${value}px`
}
