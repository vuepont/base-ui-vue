<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { Align, Side } from '../../utils/useAnchorPositioning'
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import type { TooltipInstantType } from '../root/TooltipRoot.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useAttrs, watch } from 'vue'
import { useDirection } from '../../direction-provider/DirectionContext'
import { popupStateMapping } from '../../utils/popupStateMapping'
import { REASONS } from '../../utils/reasons'
import { transitionStatusMapping } from '../../utils/stateAttributesMapping'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { useOpenChangeComplete } from '../../utils/useOpenChangeComplete'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTooltipPositionerContext } from '../positioner/TooltipPositionerContext'
import { useTooltipRootContext } from '../root/TooltipRootContext'
import { createTooltipChangeEventDetails } from '../store/TooltipHandle'

defineOptions({
  name: 'TooltipPopup',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipPopupProps>(), {
  as: 'div',
})

const attrs = useAttrs()
const ctx = useTooltipRootContext()
const positioner = useTooltipPositionerContext()
const direction = useDirection()
const generatedId = useBaseUiId(props.id)
const localPopupRef = shallowRef<HTMLElement | null>(null)

const state = computed<TooltipPopupState>(() => ({
  open: ctx.open.value,
  side: positioner.side.value,
  align: positioner.align.value,
  instant: ctx.instantType.value,
  transitionStatus: ctx.transitionStatus.value,
}))

watch(
  () => props.id,
  () => ctx.setPopupId(generatedId),
  { immediate: true },
)

watch(
  () => ctx.open.value,
  () => {
    nextTick(updatePopupSize)
  },
  { immediate: true },
)

useOpenChangeComplete({
  open: () => ctx.open.value,
  ref: localPopupRef,
  onComplete() {
    ctx.completeOpenChange()
    ctx.instantType.value = undefined
  },
})

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updatePopupSize()

  if (typeof ResizeObserver === 'undefined') {
    return
  }

  resizeObserver = new ResizeObserver(updatePopupSize)

  if (localPopupRef.value) {
    resizeObserver.observe(localPopupRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

const popupProps = computed(() => {
  const resolvedStyle = typeof props.style === 'function'
    ? props.style(state.value)
    : props.style

  return {
    ...attrs,
    id: generatedId,
    role: 'tooltip',
    style: [
      {
        '--popup-width': toCssPixel(ctx.popupWidth.value),
        '--popup-height': toCssPixel(ctx.popupHeight.value),
        '--transform-origin': getTransformOrigin(
          positioner.side.value,
          positioner.align.value,
          direction.value,
        ),
      },
      resolvedStyle,
    ],
    onMouseenter(event: MouseEvent) {
      if (!ctx.disableHoverablePopup.value) {
        ctx.clearCloseTimer()
      }

      const external = (attrs as Record<string, any>).onMouseenter
      if (typeof external === 'function') {
        external(event)
      }
    },
    onMouseleave(event: MouseEvent) {
      if (!ctx.disableHoverablePopup.value) {
        const delay = ctx.getCloseDelay(ctx.activeTrigger.value?.closeDelay)
        ctx.scheduleClose(delay, createTooltipChangeEventDetails(REASONS.triggerHover, event, ctx.activeTrigger.value?.element), ctx.activeTriggerId.value)
      }

      const external = (attrs as Record<string, any>).onMouseleave
      if (typeof external === 'function') {
        external(event)
      }
    },
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
  props: popupProps,
  stateAttributesMapping: {
    ...popupStateMapping,
    ...transitionStatusMapping,
  },
  defaultTagName: 'div',
  ref: useMergedRefs(localPopupRef, ctx.popupRef),
})

function updatePopupSize() {
  const element = localPopupRef.value

  if (!element) {
    return
  }

  const rect = element.getBoundingClientRect()
  ctx.popupWidth.value = rect.width
  ctx.popupHeight.value = rect.height
}

function toCssPixel(value: number | undefined) {
  return value === undefined ? undefined : `${value}px`
}

function getTransformOrigin(side: Side, align: Align, direction: 'ltr' | 'rtl') {
  const physicalSide = getPhysicalSide(side, direction)
  const oppositeSide: Record<string, string> = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }

  if (align === 'center') {
    return oppositeSide[physicalSide] ?? 'center'
  }

  if (physicalSide === 'top' || physicalSide === 'bottom') {
    return `${align} ${oppositeSide[physicalSide]}`
  }

  return `${oppositeSide[physicalSide]} ${align}`
}

function getPhysicalSide(side: Side, direction: 'ltr' | 'rtl') {
  return {
    'top': 'top',
    'right': 'right',
    'bottom': 'bottom',
    'left': 'left',
    'inline-end': direction === 'rtl' ? 'left' : 'right',
    'inline-start': direction === 'rtl' ? 'right' : 'left',
  }[side]
}
</script>

<script lang="ts">
export interface TooltipPopupState {
  /**
   * Whether the tooltip is currently open.
   */
  open: boolean
  /**
   * The side of the anchor the component is placed on.
   */
  side: Side
  /**
   * The alignment of the component relative to the anchor.
   */
  align: Align
  /**
   * Whether transitions should be skipped.
   */
  instant: TooltipInstantType
  /**
   * The transition status of the component.
   */
  transitionStatus: TransitionStatus
}

export interface TooltipPopupProps extends BaseUIComponentProps<TooltipPopupState> {
  /**
   * The popup id used by the trigger while open.
   */
  id?: string
}
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
