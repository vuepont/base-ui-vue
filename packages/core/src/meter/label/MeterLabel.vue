<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { MeterRootState } from '../root/MeterRoot.vue'
import { computed, useAttrs } from 'vue'
import { useRegisteredLabelId } from '../../utils/useRegisteredLabelId'
import { useRenderElement } from '../../utils/useRenderElement'
import { useMeterRootContext } from '../root/MeterRootContext'

export interface MeterLabelState extends MeterRootState {}
export interface MeterLabelProps extends BaseUIComponentProps<MeterLabelState> {
  /**
   * The id of the label element. When provided, it overrides the automatically
   * generated one.
   */
  id?: string
}

/**
 * An accessible label for the meter.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Vue Meter](https://baseui-vue.com/docs/components/meter)
 */
defineOptions({
  name: 'MeterLabel',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MeterLabelProps>(), {
  as: 'span',
})

const attrs = useAttrs()
const { setLabelId } = useMeterRootContext()

const id = useRegisteredLabelId(() => props.id, setLabelId)

const state = computed<MeterLabelState>(() => ({}))

const labelProps = computed(() => ({
  ...attrs,
  id: id.value,
  role: 'presentation',
}))

const {
  tag,
  mergedProps,
  renderless,
} = useRenderElement({
  componentProps: props,
  state,
  props: labelProps,
  defaultTagName: 'span',
})
</script>

<template>
  <slot v-if="renderless" :props="mergedProps" :state="state" />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
