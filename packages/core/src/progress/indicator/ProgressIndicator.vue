<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { ProgressRootState } from '../root/ProgressRoot.vue'
import { computed, useAttrs } from 'vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { useRenderElement } from '../../utils/useRenderElement'
import { valueToPercent } from '../../utils/valueToPercent'
import { useProgressRootContext } from '../root/ProgressRootContext'
import { progressStateAttributesMapping } from '../root/stateAttributesMapping'

export interface ProgressIndicatorState extends ProgressRootState {}
export interface ProgressIndicatorProps extends BaseUIComponentProps<ProgressIndicatorState> {}

/**
 * Visualizes the completion status of the task.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Progress](https://baseui-vue.com/docs/components/progress)
 */
defineOptions({
  name: 'ProgressIndicator',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ProgressIndicatorProps>(), {
  as: 'div',
})

const attrs = useAttrs()
const { value, min, max, state } = useProgressRootContext()

const percentage = computed(() => {
  const v = value.value
  if (v == null || !Number.isFinite(v)) {
    return null
  }
  return valueToPercent(v, min.value, max.value)
})

const indicatorStyles = computed(() => {
  if (percentage.value == null) {
    return {}
  }
  return {
    insetInlineStart: 0,
    height: 'inherit',
    width: `${percentage.value}%`,
  }
})

const indicatorProps = computed(() => mergeProps(
  { style: indicatorStyles.value },
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
  stateAttributesMapping: progressStateAttributesMapping,
})
</script>

<template>
  <slot v-if="renderless" :props="mergedProps" :state="state" />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
