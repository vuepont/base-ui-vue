<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import { computed, onBeforeUnmount, useAttrs } from 'vue'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useFieldsetRootContext } from '../root/FieldsetRootContext'

export interface FieldsetLegendState {
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean
}

export interface FieldsetLegendProps extends BaseUIComponentProps<FieldsetLegendState> {
  /**
   * The `id` attribute of the legend element.
   * When set, overrides the auto-generated id.
   */
  id?: string
}

defineOptions({
  name: 'FieldsetLegend',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FieldsetLegendProps>(), {
  as: 'div',
})

const attrs = useAttrs()

const { disabled, setLegendId } = useFieldsetRootContext()

const id = useBaseUiId(props.id)

setLegendId(id)

onBeforeUnmount(() => {
  setLegendId(undefined)
})

const state = computed<FieldsetLegendState>(() => ({
  disabled: disabled.value,
}))

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(state.value)
  return {
    ...attrs,
    id,
    class: typeof props.class === 'function' ? props.class(state.value) : props.class,
    style: typeof props.style === 'function' ? props.style(state.value) : props.style,
    ...stateAttributes,
  }
})
</script>

<template>
  <component :is="props.as" v-bind="mergedProps">
    <slot />
  </component>
</template>
