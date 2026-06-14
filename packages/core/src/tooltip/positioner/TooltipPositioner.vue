<script setup lang="ts">
import type {
  Padding,
  Placement,
  Strategy,
  VirtualElement,
} from '../../floating-ui-vue'
import type { BaseUIComponentProps } from '../../utils/types'
import type {
  Align,
  Boundary,
  CollisionAvoidance,
  OffsetFunction,
  Side,
} from '../../utils/useAnchorPositioning'
import type { TooltipInstantType } from '../root/TooltipRoot.vue'
import { computed, provide, useAttrs } from 'vue'
import { adaptiveOrigin } from '../../utils/adaptiveOriginMiddleware'
import { POPUP_COLLISION_AVOIDANCE, useAnchorPositioning } from '../../utils/useAnchorPositioning'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { usePositioner } from '../../utils/usePositioner'
import { useTooltipPortalContext } from '../portal/TooltipPortalContext'
import { useTooltipRootContext } from '../root/TooltipRootContext'
import { tooltipPositionerContextKey } from './TooltipPositionerContext'

/**
 * Positions the tooltip against the trigger.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Tooltip](https://baseui-vue.com/docs/components/tooltip)
 */
defineOptions({
  name: 'TooltipPositioner',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipPositionerProps>(), {
  as: 'div',
  positionMethod: 'absolute',
  side: 'top',
  align: 'center',
  sideOffset: 0,
  alignOffset: 0,
  collisionBoundary: 'clipping-ancestors',
  collisionPadding: 5,
  arrowPadding: 5,
  sticky: false,
  disableAnchorTracking: false,
  collisionAvoidance: () => POPUP_COLLISION_AVOIDANCE,
})

const attrs = useAttrs()
const ctx = useTooltipRootContext()
const portalKeepMounted = useTooltipPortalContext()

const reference = computed(() => props.anchor ?? ctx.activeTrigger.value?.element ?? null)

const positioning = useAnchorPositioning({
  anchor: reference,
  positionMethod: () => props.positionMethod,
  mounted: () => ctx.mounted.value,
  keepMounted: () => portalKeepMounted.value,
  side: () => props.side,
  sideOffset: () => props.sideOffset,
  align: () => props.align,
  alignOffset: () => props.alignOffset,
  collisionBoundary: () => props.collisionBoundary,
  collisionPadding: () => props.collisionPadding,
  sticky: () => props.sticky,
  arrowPadding: () => props.arrowPadding,
  disableAnchorTracking: () => props.disableAnchorTracking,
  collisionAvoidance: () => props.collisionAvoidance,
  adaptiveOrigin: () => ctx.hasViewport.value ? adaptiveOrigin : undefined,
  autoUpdateOptions: () => ({
    animationFrame: ctx.trackCursorAxis.value === 'both',
  }),
})

const shouldRender = computed(() => ctx.mounted.value || portalKeepMounted.value)
const inert = computed(() =>
  !ctx.open.value || ctx.trackCursorAxis.value === 'both' || ctx.disableHoverablePopup.value,
)

const state = computed<TooltipPositionerState>(() => ({
  open: ctx.open.value,
  side: positioning.side.value,
  align: positioning.align.value,
  anchorHidden: positioning.anchorHidden.value,
  instant: ctx.trackCursorAxis.value !== 'none' ? 'tracking-cursor' : ctx.instantType.value,
}))

const positionerProps = computed(() => {
  return attrs as Record<string, any>
})

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = usePositioner({
  as: props.as,
  class: props.class,
  style: props.style,
}, state, {
  styles: positioning.positionerStyles,
  transitionStatus: ctx.transitionStatus,
  props: positionerProps,
  refs: useMergedRefs(positioning.positionerRef, ctx.positionerRef),
  hidden: () => !ctx.mounted.value,
  inert,
})

provide(tooltipPositionerContextKey, positioning)
</script>

<script lang="ts">
export type TooltipSide = Side
export type TooltipAlign = Align
export type TooltipPositionerInstantType = TooltipInstantType | 'tracking-cursor'
export type TooltipFloatingPlacement = Placement

export interface TooltipPositionerState {
  /**
   * Whether the tooltip is currently open.
   */
  open: boolean
  /**
   * The side of the anchor the component is placed on.
   */
  side: TooltipSide
  /**
   * The alignment of the component relative to the anchor.
   */
  align: TooltipAlign
  /**
   * Whether the anchor element is hidden.
   */
  anchorHidden: boolean
  /**
   * Whether CSS transitions should be disabled.
   */
  instant: TooltipPositionerInstantType
}

export interface TooltipPositionerProps
  extends BaseUIComponentProps<TooltipPositionerState> {
  /**
   * An element to position the popup against.
   * By default, the popup will be positioned against the trigger.
   */
  anchor?: Element | VirtualElement | null
  /**
   * Determines which CSS `position` property to use.
   * @default 'absolute'
   */
  positionMethod?: Strategy
  /**
   * Which side of the anchor element to align the popup against.
   * May automatically change to avoid collisions.
   * @default 'top'
   */
  side?: TooltipSide
  /**
   * How to align the popup relative to the specified side.
   * @default 'center'
   */
  align?: TooltipAlign
  /**
   * Distance between the anchor and the popup in pixels.
   * @default 0
   */
  sideOffset?: number | OffsetFunction
  /**
   * Additional offset along the alignment axis in pixels.
   * @default 0
   */
  alignOffset?: number | OffsetFunction
  /**
   * An element or a rectangle that delimits the area that the popup is confined to.
   * @default 'clipping-ancestors'
   */
  collisionBoundary?: Boundary
  /**
   * Additional space to maintain from the edge of the collision boundary.
   * @default 5
   */
  collisionPadding?: Padding
  /**
   * Minimum distance to maintain between the arrow and the edges of the popup.
   *
   * Use it to prevent the arrow element from hanging out of the rounded corners of a popup.
   * @default 5
   */
  arrowPadding?: Padding
  /**
   * Whether to maintain the popup in the viewport after
   * the anchor element was scrolled out of view.
   * @default false
   */
  sticky?: boolean
  /**
   * Whether to disable the popup from tracking any layout shift of its positioning anchor.
   * @default false
   */
  disableAnchorTracking?: boolean
  /**
   * Determines how to handle collisions when positioning the popup.
   * @default { fallbackAxisSide: 'end' }
   */
  collisionAvoidance?: CollisionAvoidance
}
</script>

<template>
  <slot v-if="renderless && shouldRender" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else-if="shouldRender" :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
