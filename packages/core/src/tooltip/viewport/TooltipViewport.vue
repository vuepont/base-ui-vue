<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { TooltipInstantType } from '../root/TooltipRoot.vue'
import { computed, onBeforeUnmount, onMounted, shallowRef, useAttrs, watch } from 'vue'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTooltipRootContext } from '../root/TooltipRootContext'

defineOptions({
  name: 'TooltipViewport',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipViewportProps>(), {
  as: 'div',
})

const attrs = useAttrs()
const ctx = useTooltipRootContext()
const activationDirection = shallowRef<TooltipViewportState['activationDirection']>(undefined)

onMounted(() => {
  ctx.setHasViewport(true)
})

onBeforeUnmount(() => {
  ctx.setHasViewport(false)
})

watch(
  () => ctx.activeTriggerId.value,
  (nextId, previousId) => {
    const nextTrigger = ctx.store.getTrigger(nextId)
    const previousTrigger = ctx.store.getTrigger(previousId)

    if (!nextTrigger || !previousTrigger) {
      activationDirection.value = undefined
      return
    }

    const nextRect = nextTrigger.element.getBoundingClientRect()
    const previousRect = previousTrigger.element.getBoundingClientRect()
    const nextX = nextRect.left + nextRect.width / 2
    const previousX = previousRect.left + previousRect.width / 2
    const nextY = nextRect.top + nextRect.height / 2
    const previousY = previousRect.top + previousRect.height / 2
    const deltaX = nextX - previousX
    const deltaY = nextY - previousY

    activationDirection.value = Math.abs(deltaX) >= Math.abs(deltaY)
      ? deltaX < 0 ? 'left' : 'right'
      : deltaY < 0 ? 'up' : 'down'
  },
)

const state = computed<TooltipViewportState>(() => ({
  activationDirection: activationDirection.value,
  transitioning: false,
  instant: ctx.instantType.value,
}))

const viewportProps = computed(() => {
  const resolvedStyle = typeof props.style === 'function'
    ? props.style(state.value)
    : props.style

  return {
    ...attrs,
    style: resolvedStyle,
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
  props: viewportProps,
  stateAttributesMapping: {
    activationDirection(value) {
      return value ? { 'data-activation-direction': value } : null
    },
    transitioning(value) {
      return value ? { 'data-transitioning': '' } : null
    },
    instant(value) {
      return value ? { 'data-instant': value } : null
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
  activationDirection: 'left' | 'right' | 'up' | 'down' | undefined
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
    <div data-current>
      <slot :state="state" />
    </div>
  </component>
</template>
