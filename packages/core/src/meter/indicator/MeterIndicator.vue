<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { MeterRootState } from '../root/MeterRoot.vue'
import { computed, useAttrs } from 'vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { useRenderElement } from '../../utils/useRenderElement'
import { valueToPercent } from '../../utils/valueToPercent'
import { useMeterRootContext } from '../root/MeterRootContext'

export interface MeterIndicatorState extends MeterRootState {}
export interface MeterIndicatorProps extends BaseUIComponentProps<MeterIndicatorState> {}

/**
 * Visualizes the position of the value along the range.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Meter](https://baseui-vue.com/docs/components/meter)
 */
defineOptions({
  name: 'MeterIndicator',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MeterIndicatorProps>(), {
  as: 'div',
})

const attrs = useAttrs()
const rootContext = useMeterRootContext()

const percentageWidth = computed(() =>
  valueToPercent(rootContext.value.value, rootContext.min.value, rootContext.max.value),
)

const state = computed<MeterIndicatorState>(() => ({}))

const indicatorProps = computed(() => mergeProps(
  {
    style: {
      insetInlineStart: 0,
      height: 'inherit',
      width: `${percentageWidth.value}%`,
    },
  },
  attrs as Record<string, unknown>,
))

const {
  tag,
  mergedProps,
  renderless,
} = useRenderElement({
  componentProps: props,
  state,
  props: indicatorProps,
  defaultTagName: 'div',
})
</script>

<template>
  <slot v-if="renderless" :props="mergedProps" :state="state" />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
