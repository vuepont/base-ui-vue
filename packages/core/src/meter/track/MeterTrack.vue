<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { MeterRootState } from '../root/MeterRoot.vue'
import { computed, useAttrs } from 'vue'
import { useRenderElement } from '../../utils/useRenderElement'

export interface MeterTrackState extends MeterRootState {}
export interface MeterTrackProps extends BaseUIComponentProps<MeterTrackState> {}

/**
 * Contains the meter indicator and represents the entire range of the meter.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Meter](https://baseui-vue.com/docs/components/meter)
 */
defineOptions({
  name: 'MeterTrack',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MeterTrackProps>(), {
  as: 'div',
})

const attrs = useAttrs()

const state = computed<MeterTrackState>(() => ({}))

const {
  tag,
  mergedProps,
  renderless,
} = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => ({ ...attrs })),
  defaultTagName: 'div',
})
</script>

<template>
  <slot v-if="renderless" :props="mergedProps" :state="state" />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
