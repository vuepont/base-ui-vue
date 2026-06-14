<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { Align, Side } from '../../utils/useAnchorPositioning'
import type { TooltipInstantType } from '../root/TooltipRoot.vue'
import { computed, useAttrs } from 'vue'
import { popupStateMapping } from '../../utils/popupStateMapping'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTooltipPositionerContext } from '../positioner/TooltipPositionerContext'
import { useTooltipRootContext } from '../root/TooltipRootContext'
import { TooltipArrowDataAttributes } from './TooltipArrowDataAttributes'

/**
 * Displays an element positioned against the tooltip anchor.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Tooltip](https://baseui-vue.com/docs/components/tooltip)
 */
defineOptions({
  name: 'TooltipArrow',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipArrowProps>(), {
  as: 'div',
})

const attrs = useAttrs()
const ctx = useTooltipRootContext()
const positioner = useTooltipPositionerContext()

const state = computed<TooltipArrowState>(() => ({
  open: ctx.open.value,
  side: positioner.side.value,
  align: positioner.align.value,
  uncentered: positioner.arrowUncentered.value,
  instant: ctx.instantType.value,
}))

const arrowStyle = computed(() => {
  return positioner.arrowStyles.value
})

const arrowProps = computed(() => {
  const resolvedStyle = typeof props.style === 'function'
    ? props.style(state.value)
    : props.style

  return {
    ...attrs,
    'aria-hidden': 'true',
    'style': [
      arrowStyle.value,
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
  props: arrowProps,
  stateAttributesMapping: {
    ...popupStateMapping,
    uncentered(value) {
      return value ? { [TooltipArrowDataAttributes.uncentered]: '' } : null
    },
    instant(value) {
      return value ? { [TooltipArrowDataAttributes.instant]: value } : null
    },
  },
  defaultTagName: 'div',
  ref: positioner.arrowRef,
})
</script>

<script lang="ts">
export interface TooltipArrowState {
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
   * Whether the arrow cannot be centered on the anchor.
   */
  uncentered: boolean
  /**
   * Whether transitions should be skipped.
   */
  instant: TooltipInstantType
}

export interface TooltipArrowProps extends BaseUIComponentProps<TooltipArrowState> {}
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
