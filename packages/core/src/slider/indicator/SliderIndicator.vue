<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { BaseUIComponentProps } from '../../utils/types'
import type { SliderRootState } from '../root/SliderRoot.vue'
import { computed, onMounted, ref, useAttrs } from 'vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { useRenderElement } from '../../utils/useRenderElement'
import { valueToPercent } from '../../utils/valueToPercent'
import { useSliderRootContext } from '../root/SliderRootContext'
import { sliderStateAttributesMapping } from '../root/stateAttributesMapping'

/**
 * Visualizes the current value of the slider.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Slider](https://baseui-vue.com/docs/components/slider)
 */
defineOptions({
  name: 'SliderIndicator',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SliderIndicatorProps>(), {
  as: 'div',
})

function getInsetStyles(
  vertical: boolean,
  range: boolean,
  start: number | undefined,
  end: number | undefined,
  renderBeforeHydration: boolean,
  mounted: boolean,
): CSSProperties & Record<string, unknown> {
  const visibility
    = start === undefined || (range && end === undefined) ? 'hidden' : undefined

  const startEdge = vertical ? 'bottom' : 'insetInlineStart'
  const mainSide = vertical ? 'height' : 'width'
  const crossSide = vertical ? 'width' : 'height'

  const styles: CSSProperties & Record<string, unknown> = {
    visibility: renderBeforeHydration && !mounted ? 'hidden' : visibility,
    position: vertical ? 'absolute' : 'relative',
    [crossSide]: 'inherit',
  }

  styles['--start-position'] = `${start ?? 0}%`

  if (!range) {
    styles[startEdge] = 0
    styles[mainSide] = 'var(--start-position)'
    return styles
  }

  styles['--relative-size'] = `${(end ?? 0) - (start ?? 0)}%`
  styles[startEdge] = 'var(--start-position)'
  styles[mainSide] = 'var(--relative-size)'
  return styles
}

function getCenteredStyles(
  vertical: boolean,
  range: boolean,
  start: number,
  end: number,
): CSSProperties {
  const startEdge = vertical ? 'bottom' : 'insetInlineStart'
  const mainSide = vertical ? 'height' : 'width'
  const crossSide = vertical ? 'width' : 'height'

  const styles: CSSProperties = {
    position: vertical ? 'absolute' : 'relative',
    [crossSide]: 'inherit',
  }

  if (!range) {
    styles[startEdge] = 0
    styles[mainSide] = `${start}%`
    return styles
  }

  styles[startEdge] = `${start}%`
  styles[mainSide] = `${end - start}%`
  return styles
}

export interface SliderIndicatorState extends SliderRootState {}
export interface SliderIndicatorProps extends BaseUIComponentProps<SliderIndicatorState> {}

const attrs = useAttrs()
const rootContext = useSliderRootContext()
const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

const vertical = computed(() => rootContext.orientation.value === 'vertical')
const range = computed(() => rootContext.values.value.length > 1)

const style = computed(() => rootContext.inset.value
  ? getInsetStyles(
      vertical.value,
      range.value,
      rootContext.indicatorPosition.value[0],
      rootContext.indicatorPosition.value[1],
      rootContext.renderBeforeHydration.value,
      isMounted.value,
    )
  : getCenteredStyles(
      vertical.value,
      range.value,
      valueToPercent(rootContext.values.value[0], rootContext.min.value, rootContext.max.value),
      valueToPercent(
        rootContext.values.value[rootContext.values.value.length - 1],
        rootContext.min.value,
        rootContext.max.value,
      ),
    ))

const indicatorProps = computed(() => mergeProps(
  attrs as Record<string, unknown>,
  {
    'data-base-ui-slider-indicator': rootContext.renderBeforeHydration.value ? '' : undefined,
    'style': style.value,
    'suppressHydrationWarning': rootContext.renderBeforeHydration.value || undefined,
  },
))

const { tag, mergedProps, renderless, ref: renderRef } = useRenderElement({
  componentProps: props,
  state: rootContext.state,
  props: indicatorProps,
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
