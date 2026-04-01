<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { SliderRootState } from '../root/SliderRoot.vue'
import { computed, useAttrs } from 'vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { formatNumber } from '../../utils/formatNumber'
import { useRenderElement } from '../../utils/useRenderElement'
import { useSliderRootContext } from '../root/SliderRootContext'
import { sliderStateAttributesMapping } from '../root/stateAttributesMapping'

export interface SliderValueState extends SliderRootState {}
export interface SliderValueProps extends BaseUIComponentProps<SliderValueState> {
  ariaLive?: 'off' | 'polite' | 'assertive'
}

/**
 * Displays the current value of the slider as text.
 * Renders an `<output>` element.
 *
 * Documentation: [Base UI Slider](https://baseui-vue.com/docs/components/slider)
 */
defineOptions({
  name: 'SliderValue',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SliderValueProps>(), {
  as: 'output',
  ariaLive: 'off',
})

const attrs = useAttrs()
const rootContext = useSliderRootContext()

const outputFor = computed(() => {
  let htmlFor = ''
  for (const thumbMetadata of rootContext.thumbMap.value.values()) {
    if (thumbMetadata?.inputId) {
      htmlFor += `${thumbMetadata.inputId} `
    }
  }

  return htmlFor.trim() === '' ? undefined : htmlFor.trim()
})

const formattedValues = computed(() =>
  rootContext.values.value.map(value =>
    formatNumber(value, rootContext.locale.value, rootContext.formatOptionsRef.value),
  ))

const defaultDisplayValue = computed(() =>
  rootContext.values.value
    .map((value, index) => formattedValues.value[index] || String(value))
    .join(' – '))

const valueProps = computed(() => mergeProps(
  attrs as Record<string, unknown>,
  {
    'aria-live': props.ariaLive,
    'for': outputFor.value,
  },
))

const { tag, mergedProps, renderless, ref: renderRef } = useRenderElement({
  componentProps: props,
  state: rootContext.state,
  props: valueProps,
  defaultTagName: 'output',
  stateAttributesMapping: sliderStateAttributesMapping,
})
</script>

<template>
  <slot
    v-if="renderless"
    :ref="renderRef"
    :props="mergedProps"
    :state="rootContext.state"
    :formatted-values="formattedValues"
    :values="rootContext.values.value"
  />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot
      :formatted-values="formattedValues"
      :values="rootContext.values.value"
    >
      {{ defaultDisplayValue }}
    </slot>
  </component>
</template>
