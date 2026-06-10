<script setup lang="ts">
import type { TooltipArrowProps, TooltipArrowState } from '../tooltip.types'
import { computed, useAttrs } from 'vue'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTooltipRootContext } from '../root/TooltipRootContext'
import { popupStateMapping } from '../utils/popupStateMapping'

defineOptions({
  name: 'TooltipArrow',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipArrowProps>(), {
  as: 'div',
})

const attrs = useAttrs()
const ctx = useTooltipRootContext()

const state = computed<TooltipArrowState>(() => ({
  open: ctx.open.value,
  side: ctx.side.value,
  align: ctx.align.value,
  uncentered: ctx.arrowUncentered.value,
  instant: ctx.instantType.value,
}))

const arrowStyle = computed(() => {
  return {
    position: 'absolute',
    left: ctx.arrowX.value == null ? undefined : `${ctx.arrowX.value}px`,
    top: ctx.arrowY.value == null ? undefined : `${ctx.arrowY.value}px`,
  }
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
      return value ? { 'data-uncentered': '' } : null
    },
  },
  defaultTagName: 'div',
  ref: ctx.arrowRef,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
