<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import { computed, onBeforeUnmount, useAttrs } from 'vue'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useRenderElement } from '../../utils/useRenderElement'
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

/**
 * An accessible label that is automatically associated with the fieldset.
 * Renders a \`<div>\` element.
 *
 * Documentation: [Base UI Vue Fieldset](https://baseui-vue.com/components/fieldset)
 */
defineOptions({
  name: 'FieldsetLegend',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FieldsetLegendProps>(), {
  as: 'div',
})

const attrs = useAttrs()

const { disabled, legendId, setLegendId } = useFieldsetRootContext()

const id = useBaseUiId(props.id)

setLegendId(id)

onBeforeUnmount(() => {
  if (legendId.value === id) {
    setLegendId(undefined)
  }
})

const state = computed<FieldsetLegendState>(() => ({
  disabled: disabled.value,
}))

const { tag, mergedProps, renderless } = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => ({
    ...attrs,
    id,
  })),
  defaultTagName: 'div',
})
</script>

<template>
  <slot v-if="renderless" :props="mergedProps" :state="state" />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
