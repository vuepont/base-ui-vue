<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { MeterRootState } from '../root/MeterRoot.vue'
import { computed, useAttrs } from 'vue'
import { useRenderElement } from '../../utils/useRenderElement'
import { useMeterRootContext } from '../root/MeterRootContext'

export interface MeterValueState extends MeterRootState {}
export interface MeterValueProps extends BaseUIComponentProps<MeterValueState> {}

export interface MeterValueSlotProps {
  formattedValue: string
  value: number
}

export interface MeterValueRenderlessSlotProps extends MeterValueSlotProps {
  props: Record<string, unknown>
  state: MeterValueState
}

/**
 * A text element displaying the current value.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Vue Meter](https://baseui-vue.com/docs/components/meter)
 */
defineOptions({
  name: 'MeterValue',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MeterValueProps>(), {
  as: 'span',
})

defineSlots<{
  default?: (props: MeterValueSlotProps | MeterValueRenderlessSlotProps) => unknown
}>()

const attrs = useAttrs()
const { value, formattedValue } = useMeterRootContext()

const state = computed<MeterValueState>(() => ({}))

const defaultDisplay = computed(() => {
  if (formattedValue.value) {
    return formattedValue.value
  }
  return value.value != null ? String(value.value) : ''
})

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
})
</script>

<template>
  <slot
    v-if="renderless"
    :props="mergedProps"
    :state="state"
    :formatted-value="formattedValue"
    :value="value"
  />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot
      :formatted-value="formattedValue"
      :value="value"
    >
      {{ defaultDisplay }}
    </slot>
  </component>
</template>
