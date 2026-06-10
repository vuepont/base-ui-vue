<script setup lang="ts">
import type { Middleware, Padding, Placement } from '@floating-ui/vue'
import type { TooltipAlign, TooltipPositionerProps, TooltipPositionerState, TooltipSide } from '../tooltip.types'
import {
  arrow,
  autoUpdate,
  flip,
  hide,
  offset,
  shift,
  size,
  useFloating,
} from '@floating-ui/vue'
import { computed, provide, shallowRef, useAttrs, watchEffect } from 'vue'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTooltipPortalContext } from '../portal/TooltipPortalContext'
import { useTooltipRootContext } from '../root/TooltipRootContext'
import { popupStateMapping } from '../utils/popupStateMapping'
import { tooltipPositionerContextKey } from './TooltipPositionerContext'
import { TooltipPositionerCssVars } from './TooltipPositionerCssVars'

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
  collisionPadding: 5,
  arrowPadding: 5,
  sticky: false,
  disableAnchorTracking: false,
})

const attrs = useAttrs()
const ctx = useTooltipRootContext()
const portalKeepMounted = useTooltipPortalContext()

const positionerRef = shallowRef<HTMLElement | null>(null)

const reference = computed(() => props.anchor ?? ctx.activeTrigger.value?.element ?? null)

const placement = computed<Placement>(() => {
  if (props.align === 'center') {
    return props.side
  }

  return `${props.side}-${props.align}` as Placement
})

const middleware = computed<Middleware[]>(() => [
  offset({
    mainAxis: props.sideOffset,
    crossAxis: props.alignOffset,
  }),
  flip({
    boundary: props.collisionBoundary,
    padding: props.collisionPadding,
  }),
  shift({
    boundary: props.collisionBoundary,
    padding: props.collisionPadding,
  }),
  size({
    boundary: props.collisionBoundary,
    padding: props.collisionPadding,
    apply({ rects, availableWidth, availableHeight }) {
      ctx.setPositionerSize({
        width: rects.floating.width,
        height: rects.floating.height,
        availableWidth,
        availableHeight,
        anchorWidth: rects.reference.width,
        anchorHeight: rects.reference.height,
      })
    },
  }),
  arrow({
    element: ctx.arrowRef,
    padding: props.arrowPadding as Padding,
  }),
  hide({
    boundary: props.collisionBoundary,
    padding: props.collisionPadding,
  }),
])

const floating = useFloating(reference, positionerRef, {
  open: () => ctx.mounted.value,
  placement,
  strategy: () => props.positionMethod,
  middleware,
  whileElementsMounted(referenceEl, floatingEl, update) {
    if (props.disableAnchorTracking) {
      update()
      return () => {}
    }

    return autoUpdate(referenceEl, floatingEl, update, {
      animationFrame: ctx.trackCursorAxis.value === 'both',
    } as any)
  },
  transform: false,
})

const derivedSide = computed(() => getSide(floating.placement.value))
const derivedAlign = computed(() => getAlign(floating.placement.value))
const shouldRender = computed(() => ctx.mounted.value || portalKeepMounted?.value)
const anchorHidden = computed(() =>
  Boolean(floating.middlewareData.value.hide?.referenceHidden),
)

watchEffect(() => {
  ctx.side.value = derivedSide.value
  ctx.align.value = derivedAlign.value
  ctx.anchorHidden.value = anchorHidden.value

  const arrowData = floating.middlewareData.value.arrow
  ctx.arrowX.value = typeof arrowData?.x === 'number' ? arrowData.x : undefined
  ctx.arrowY.value = typeof arrowData?.y === 'number' ? arrowData.y : undefined
  ctx.arrowUncentered.value = Boolean(arrowData && Math.abs(arrowData.centerOffset ?? 0) > 0)
})

const state = computed<TooltipPositionerState>(() => ({
  open: ctx.open.value,
  side: derivedSide.value,
  align: derivedAlign.value,
  anchorHidden: anchorHidden.value,
  instant: ctx.trackCursorAxis.value !== 'none' ? 'tracking-cursor' : ctx.instantType.value,
}))

const cssVars = computed(() => ({
  [TooltipPositionerCssVars.availableWidth]: toCssPixel(ctx.availableWidth.value),
  [TooltipPositionerCssVars.availableHeight]: toCssPixel(ctx.availableHeight.value),
  [TooltipPositionerCssVars.anchorWidth]: toCssPixel(ctx.anchorWidth.value),
  [TooltipPositionerCssVars.anchorHeight]: toCssPixel(ctx.anchorHeight.value),
  [TooltipPositionerCssVars.positionerWidth]: toCssPixel(ctx.positionerWidth.value),
  [TooltipPositionerCssVars.positionerHeight]: toCssPixel(ctx.positionerHeight.value),
  [TooltipPositionerCssVars.transformOrigin]: getTransformOrigin(derivedSide.value, derivedAlign.value),
}))

const positionerProps = computed(() => {
  const resolvedStyle = typeof props.style === 'function'
    ? props.style(state.value)
    : props.style

  return {
    ...attrs,
    hidden: shouldRender.value ? undefined : true,
    inert: !ctx.open.value || ctx.trackCursorAxis.value === 'both' || ctx.disableHoverablePopup.value
      ? ''
      : undefined,
    style: [
      floating.floatingStyles.value,
      cssVars.value,
      resolvedStyle,
    ],
  }
})

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: {
    as: props.as,
    class: props.class,
  },
  state,
  props: positionerProps,
  stateAttributesMapping: {
    ...popupStateMapping,
  },
  defaultTagName: 'div',
  ref: positionerRef,
})

provide(tooltipPositionerContextKey, {
  side: ctx.side,
  align: ctx.align,
  arrowRef: ctx.arrowRef,
  arrowX: ctx.arrowX,
  arrowY: ctx.arrowY,
  arrowUncentered: ctx.arrowUncentered,
})

function getSide(value: Placement): TooltipSide {
  return value.split('-')[0] as TooltipSide
}

function getAlign(value: Placement): TooltipAlign {
  return (value.split('-')[1] as TooltipAlign | undefined) ?? 'center'
}

function toCssPixel(value: number | undefined) {
  return value === undefined ? undefined : `${value}px`
}

function getTransformOrigin(side: TooltipSide, align: TooltipAlign) {
  const oppositeSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[side]

  if (align === 'center') {
    return oppositeSide
  }

  if (side === 'top' || side === 'bottom') {
    return `${align} ${oppositeSide}`
  }

  return `${oppositeSide} ${align}`
}
</script>

<template>
  <slot v-if="renderless && shouldRender" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else-if="shouldRender" :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
