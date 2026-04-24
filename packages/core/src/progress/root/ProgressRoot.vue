<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import { computed, provide, ref, useAttrs } from 'vue'
import { formatNumberValue } from '../../utils/formatNumber'
import { useRenderElement } from '../../utils/useRenderElement'
import { visuallyHidden } from '../../utils/visuallyHidden'
import { progressRootContextKey } from './ProgressRootContext'
import { progressStateAttributesMapping } from './stateAttributesMapping'

export type ProgressStatus = 'indeterminate' | 'progressing' | 'complete'

export interface ProgressRootState {
  /**
   * The current status.
   */
  status: ProgressStatus
}

export interface ProgressRootProps extends BaseUIComponentProps<ProgressRootState> {
  /**
   * A string value that provides a user-friendly name for `aria-valuenow`.
   * Takes precedence over `getAriaValueText`.
   */
  ariaValuetext?: string
  /**
   * Options to format the value.
   */
  format?: Intl.NumberFormatOptions
  /**
   * A function that returns a string value for `aria-valuetext`.
   * Receives the formatted value (or `null` when indeterminate) and the raw
   * value.
   */
  getAriaValueText?: (formattedValue: string | null, value: number | null) => string
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
   * The current value. The component is indeterminate when value is `null`.
   * @default null
   */
  value: number | null
}

/**
 * Groups all parts of the progress bar and provides the task completion
 * status to screen readers.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Progress](https://baseui-vue.com/docs/components/progress)
 */
defineOptions({
  name: 'ProgressRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ProgressRootProps>(), {
  as: 'div',
  max: 100,
  min: 0,
})

function getDefaultAriaValueText(formattedValue: string | null, value: number | null) {
  if (value == null) {
    return 'indeterminate progress'
  }

  return formattedValue || `${value}%`
}

const attrs = useAttrs()

const labelId = ref<string | undefined>(undefined)

const status = computed<ProgressStatus>(() => {
  if (props.value == null || !Number.isFinite(props.value)) {
    return 'indeterminate'
  }
  return props.value === props.max ? 'complete' : 'progressing'
})

const formattedValue = computed(() =>
  formatNumberValue(props.value, props.locale, props.format),
)

const ariaValueText = computed(() => {
  if (props.ariaValuetext !== undefined) {
    return props.ariaValuetext
  }

  const formatted = props.value == null ? null : formattedValue.value

  if (props.getAriaValueText) {
    return props.getAriaValueText(formatted, props.value)
  }

  return getDefaultAriaValueText(formatted, props.value)
})

const state = computed<ProgressRootState>(() => ({
  status: status.value,
}))

provide(progressRootContextKey, {
  formattedValue,
  max: computed(() => props.max),
  min: computed(() => props.min),
  value: computed(() => props.value),
  status,
  state,
  setLabelId(id) {
    labelId.value = id
  },
})

const rootProps = computed(() => ({
  'role': 'progressbar',
  'aria-labelledby': labelId.value,
  'aria-valuemax': props.max,
  'aria-valuemin': props.min,
  'aria-valuenow': props.value ?? undefined,
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
  stateAttributesMapping: progressStateAttributesMapping,
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
