<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { SliderRootState } from '../root/SliderRoot.vue'
import { isHTMLElement } from '@floating-ui/utils/dom'
import { computed, useAttrs } from 'vue'
import { focusElementWithVisible, useLabel } from '../../labelable-provider/useLabel'
import { mergeProps } from '../../merge-props/mergeProps'
import { ownerDocument } from '../../utils/owner'
import { useRenderElement } from '../../utils/useRenderElement'
import { useSliderRootContext } from '../root/SliderRootContext'
import { sliderStateAttributesMapping } from '../root/stateAttributesMapping'

export type SliderLabelState = SliderRootState
export interface SliderLabelProps extends BaseUIComponentProps<SliderLabelState> {}

/**
 * An accessible label that is automatically associated with the slider thumbs.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Slider](https://baseui-vue.com/docs/components/slider)
 */
defineOptions({
  name: 'SliderLabel',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SliderLabelProps>(), {
  as: 'div',
})

const attrs = useAttrs()
const rootContext = useSliderRootContext()
const label = useLabel({
  id: computed(() => rootContext.rootLabelId.value),
  fallbackControlId: computed(() => rootContext.controlRef.value?.id),
  setLabelId: rootContext.setLabelId,
  focusControl(_event, controlId) {
    if (controlId) {
      const controlElement = rootContext.controlRef.value
        ? ownerDocument(rootContext.controlRef.value).getElementById(controlId)
        : null
      if (isHTMLElement(controlElement)) {
        focusElementWithVisible(controlElement)
        return
      }
    }

    const fallbackInputs = rootContext.controlRef.value?.querySelectorAll('input[type="range"]')
    const fallbackInput = fallbackInputs?.length === 1 ? fallbackInputs[0] : null
    if (isHTMLElement(fallbackInput)) {
      focusElementWithVisible(fallbackInput)
    }
  },
})

const labelProps = computed(() => mergeProps(
  attrs as Record<string, unknown>,
  label.props.value,
))

const { tag, mergedProps, renderless, ref: renderRef } = useRenderElement({
  componentProps: props,
  state: rootContext.state,
  props: labelProps,
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
