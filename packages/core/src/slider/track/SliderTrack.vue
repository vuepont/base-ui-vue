<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { SliderRootState } from '../root/SliderRoot.vue'
import { computed, useAttrs } from 'vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { useRenderElement } from '../../utils/useRenderElement'
import { useSliderRootContext } from '../root/SliderRootContext'
import { sliderStateAttributesMapping } from '../root/stateAttributesMapping'

export interface SliderTrackState extends SliderRootState {}
export interface SliderTrackProps extends BaseUIComponentProps<SliderTrackState> {}

defineOptions({
  name: 'SliderTrack',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SliderTrackProps>(), {
  as: 'div',
})

const attrs = useAttrs()
const rootContext = useSliderRootContext()

const trackProps = computed(() => mergeProps(
  attrs as Record<string, unknown>,
  {
    style: {
      position: 'relative',
    },
  },
))

const { tag, mergedProps, renderless, ref: renderRef } = useRenderElement({
  componentProps: props,
  state: rootContext.state,
  props: trackProps,
  defaultTagName: 'div',
  stateAttributesMapping: sliderStateAttributesMapping,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="rootContext.state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot />
  </component>
</template>
