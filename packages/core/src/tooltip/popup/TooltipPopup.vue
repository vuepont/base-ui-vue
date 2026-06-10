<script setup lang="ts">
import type { TooltipPopupProps, TooltipPopupState } from '../tooltip.types'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useAttrs, watch } from 'vue'
import { REASONS } from '../../utils/reasons'
import { transitionStatusMapping } from '../../utils/stateAttributesMapping'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { useOpenChangeComplete } from '../../utils/useOpenChangeComplete'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTooltipRootContext } from '../root/TooltipRootContext'
import { createTooltipChangeEventDetails } from '../store/TooltipHandle'
import { popupStateMapping } from '../utils/popupStateMapping'

defineOptions({
  name: 'TooltipPopup',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipPopupProps>(), {
  as: 'div',
})

const attrs = useAttrs()
const ctx = useTooltipRootContext()
const generatedId = useBaseUiId(props.id)
const localPopupRef = shallowRef<HTMLElement | null>(null)

const state = computed<TooltipPopupState>(() => ({
  open: ctx.open.value,
  side: ctx.side.value,
  align: ctx.align.value,
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
        '--transform-origin': getTransformOrigin(ctx.side.value, ctx.align.value),
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

function getTransformOrigin(side: string, align: string) {
  const oppositeSide: Record<string, string> = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }

  if (align === 'center') {
    return oppositeSide[side] ?? 'center'
  }

  if (side === 'top' || side === 'bottom') {
    return `${align} ${oppositeSide[side]}`
  }

  return `${oppositeSide[side]} ${align}`
}
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
