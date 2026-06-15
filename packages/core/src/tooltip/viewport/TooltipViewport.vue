<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { TooltipInstantType } from '../root/TooltipRoot.vue'
import { computed, onBeforeUnmount, onMounted, useAttrs } from 'vue'
import { useDirection } from '../../direction-provider/DirectionContext'
import { usePopupViewport } from '../../utils/usePopupViewport'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTooltipPositionerContext } from '../positioner/TooltipPositionerContext'
import { useTooltipRootContext } from '../root/TooltipRootContext'
import { TooltipViewportCssVars } from './TooltipViewportCssVars'
import { TooltipViewportDataAttributes } from './TooltipViewportDataAttributes'

/**
 * A viewport for displaying content transitions.
 * This component is only required if one popup can be opened by multiple triggers, its content
 * changes based on the trigger, and switching between them is animated.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Tooltip](https://baseui-vue.com/docs/components/tooltip)
 */
defineOptions({
  name: 'TooltipViewport',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipViewportProps>(), {
  as: 'div',
})

const attrs = useAttrs()
const ctx = useTooltipRootContext()
const positioner = useTooltipPositionerContext()
const direction = useDirection()

onMounted(() => {
  ctx.setHasViewport(true)
})

onBeforeUnmount(() => {
  ctx.setHasViewport(false)
})

const viewport = usePopupViewport({
  activeTriggerElement: () => ctx.activeTrigger.value?.element,
  activeTriggerId: ctx.activeTriggerId,
  open: ctx.open,
  mounted: ctx.mounted,
  popupElement: ctx.popupRef,
  positionerElement: ctx.positionerRef,
  side: positioner.side,
  direction,
  payload: ctx.payload,
  cssVars: TooltipViewportCssVars,
})

const {
  currentContainerRef,
  previousContainerRef,
  currentContentKey,
  currentContainerProps,
  previousContainerProps,
  transitioning,
} = viewport

const state = computed<TooltipViewportState>(() => ({
  activationDirection: viewport.state.value.activationDirection,
  transitioning: viewport.state.value.transitioning,
  instant: ctx.instantType.value,
}))

const viewportProps = computed(() => {
  return {
    ...attrs,
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
    style: props.style,
  },
  state,
  props: viewportProps,
  stateAttributesMapping: {
    activationDirection(value) {
      return value ? { [TooltipViewportDataAttributes.activationDirection]: value } : null
    },
    transitioning(value) {
      return value ? { [TooltipViewportDataAttributes.transitioning]: '' } : null
    },
    instant(value) {
      return value ? { [TooltipViewportDataAttributes.instant]: value } : null
    },
  },
  defaultTagName: 'div',
})
</script>

<script lang="ts">
export interface TooltipViewportState {
  /**
   * The activation direction of the transitioned content.
   */
  activationDirection: string | undefined
  /**
   * Whether the viewport is currently transitioning between contents.
   */
  transitioning: boolean
  /**
   * Present if animations should be instant.
   */
  instant: TooltipInstantType
}

export interface TooltipViewportProps extends BaseUIComponentProps<TooltipViewportState> {}
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <template v-if="transitioning">
      <div
        ref="previousContainerRef"
        v-bind="previousContainerProps"
      />
      <div
        :key="currentContentKey"
        ref="currentContainerRef"
        v-bind="currentContainerProps"
      >
        <slot :state="state" />
      </div>
    </template>
    <div
      v-else
      :key="currentContentKey"
      ref="currentContainerRef"
      v-bind="currentContainerProps"
    >
      <slot :state="state" />
    </div>
  </component>
</template>
