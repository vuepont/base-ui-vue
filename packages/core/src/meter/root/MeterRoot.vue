<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import { computed, provide, ref, useAttrs } from 'vue'
import { formatNumberValue } from '../../utils/formatNumber'
import { useRenderElement } from '../../utils/useRenderElement'
import { visuallyHidden } from '../../utils/visuallyHidden'
import { meterRootContextKey } from './MeterRootContext'

export interface MeterRootState {}

export interface MeterRootProps extends BaseUIComponentProps<MeterRootState> {
  /**
   * A string value that provides a user-friendly name for `aria-valuenow`,
   * the current value of the meter.
   */
  ariaValuetext?: string
  /**
   * Options to format the value.
   */
  format?: Intl.NumberFormatOptions
  /**
   * A function that returns a string value that provides a human-readable
   * text alternative for `aria-valuenow`, the current value of the meter.
   */
  getAriaValueText?: (formattedValue: string, value: number) => string
  /**
   * The locale used by `Intl.NumberFormat` when formatting the value.
   * Defaults to the user's runtime locale.
   */
  locale?: Intl.LocalesArgument
  /**
   * The maximum value.
   * @default 100
   */
  max?: number
  /**
   * The minimum value.
   * @default 0
   */
  min?: number
  /**
   * The current value.
   */
  value: number
}

/**
 * Groups all parts of the meter and provides the value for screen readers.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Meter](https://baseui-vue.com/docs/components/meter)
 */
defineOptions({
  name: 'MeterRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MeterRootProps>(), {
  as: 'div',
  max: 100,
  min: 0,
})

const attrs = useAttrs()

const labelId = ref<string | undefined>(undefined)

const formattedValue = computed(() =>
  formatNumberValue(props.value, props.locale, props.format),
)

const ariaValueText = computed(() => {
  if (props.ariaValuetext !== undefined) {
    return props.ariaValuetext
  }

  if (props.getAriaValueText) {
    return props.getAriaValueText(formattedValue.value, props.value)
  }

  if (props.format) {
    return formattedValue.value
  }

  return `${props.value}%`
})

provide(meterRootContextKey, {
  formattedValue,
  max: computed(() => props.max),
  min: computed(() => props.min),
  value: computed(() => props.value),
  setLabelId(id) {
    labelId.value = id
  },
})

const state = computed<MeterRootState>(() => ({}))

const rootProps = computed(() => ({
  'role': 'meter',
  'aria-labelledby': labelId.value,
  'aria-valuemax': props.max,
  'aria-valuemin': props.min,
  'aria-valuenow': props.value,
  'aria-valuetext': ariaValueText.value,
  ...attrs,
}))

const {
  tag,
  mergedProps,
  renderless,
} = useRenderElement({
  componentProps: props,
  state,
  props: rootProps,
  defaultTagName: 'div',
})

const visuallyHiddenStyle = visuallyHidden
</script>

<template>
  <slot v-if="renderless" :props="mergedProps" :state="state" />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot :state="state" />
    <!-- Force NVDA to read the label https://github.com/mui/base-ui/issues/4184 -->
    <span role="presentation" :style="visuallyHiddenStyle">x</span>
  </component>
</template>
