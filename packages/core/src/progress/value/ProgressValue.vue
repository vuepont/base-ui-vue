<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { ProgressRootState } from '../root/ProgressRoot.vue'
import { computed, useAttrs } from 'vue'
import { useRenderElement } from '../../utils/useRenderElement'
import { useProgressRootContext } from '../root/ProgressRootContext'
import { progressStateAttributesMapping } from '../root/stateAttributesMapping'

export interface ProgressValueState extends ProgressRootState {}
export interface ProgressValueProps extends BaseUIComponentProps<ProgressValueState> {}

export interface ProgressValueSlotProps {
  /**
   * Formatted value. `"indeterminate"` when the root value is `null`.
   */
  formattedValue: string | 'indeterminate'
  /**
   * Raw numeric value, or `null` when indeterminate.
   */
  value: number | null
}

export interface ProgressValueRenderlessSlotProps extends ProgressValueSlotProps {
  props: Record<string, unknown>
  state: ProgressValueState
}

/**
 * A text label displaying the current value.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Vue Progress](https://baseui-vue.com/docs/components/progress)
 */
defineOptions({
  name: 'ProgressValue',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ProgressValueProps>(), {
  as: 'span',
})

defineSlots<{
  default?: (props: ProgressValueSlotProps | ProgressValueRenderlessSlotProps) => unknown
}>()

const attrs = useAttrs()
const { value, formattedValue, state } = useProgressRootContext()

const slotFormattedValue = computed<string | 'indeterminate'>(() =>
  value.value == null ? 'indeterminate' : formattedValue.value,
)

const defaultDisplay = computed(() =>
  value.value == null ? '' : formattedValue.value,
)

const valueProps = computed(() => ({
  'aria-hidden': true,
  ...attrs,
}))

const {
  tag,
  mergedProps,
  renderless,
} = useRenderElement({
  componentProps: props,
  state,
  props: valueProps,
  defaultTagName: 'span',
  stateAttributesMapping: progressStateAttributesMapping,
})
</script>

<template>
  <slot
    v-if="renderless"
    :props="mergedProps"
    :state="state"
    :formatted-value="slotFormattedValue"
    :value="value"
  />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot
      :formatted-value="slotFormattedValue"
      :value="value"
    >
      {{ defaultDisplay }}
    </slot>
  </component>
</template>
