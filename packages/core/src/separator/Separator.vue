<script setup lang="ts">
import type { BaseUIComponentProps, Orientation } from '../utils/types'
import { computed, useAttrs } from 'vue'
import { useRenderElement } from '../utils/useRenderElement'

export interface SeparatorState {
  /**
   * The orientation of the separator.
   */
  orientation: Orientation
}

export interface SeparatorProps extends BaseUIComponentProps<SeparatorState> {
  /**
   * The orientation of the separator.
   * @default 'horizontal'
   */
  orientation?: Orientation
}

/**
 * A separator element accessible to screen readers.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Separator](https://baseui-vue.com/docs/components/separator)
 */
defineOptions({
  name: 'Separator',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SeparatorProps>(), {
  as: 'div',
  orientation: 'horizontal',
})

const attrs = useAttrs()

const state = computed<SeparatorState>(() => ({
  orientation: props.orientation,
}))

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => ({
    ...attrs,
    'role': 'separator',
    'aria-orientation': props.orientation,
  })),
  defaultTagName: 'div',
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
