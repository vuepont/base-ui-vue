<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { ProgressRootState } from '../root/ProgressRoot.vue'
import { useAttrs } from 'vue'
import { useRenderElement } from '../../utils/useRenderElement'
import { useProgressRootContext } from '../root/ProgressRootContext'
import { progressStateAttributesMapping } from '../root/stateAttributesMapping'

export interface ProgressTrackState extends ProgressRootState {}
export interface ProgressTrackProps extends BaseUIComponentProps<ProgressTrackState> {}

/**
 * Contains the progress bar indicator.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Progress](https://baseui-vue.com/docs/components/progress)
 */
defineOptions({
  name: 'ProgressTrack',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ProgressTrackProps>(), {
  as: 'div',
})

const attrs = useAttrs()
const { state } = useProgressRootContext()

const {
  tag,
  mergedProps,
  renderless,
} = useRenderElement({
  componentProps: props,
  state,
  props: attrs,
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
