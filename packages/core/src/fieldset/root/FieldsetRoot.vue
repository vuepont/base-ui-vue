<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import { computed, provide, ref, useAttrs } from 'vue'
import { useRenderElement } from '../../utils/useRenderElement'
import { fieldsetRootContextKey } from './FieldsetRootContext'

export interface FieldsetRootState {
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean
}

export interface FieldsetRootProps extends BaseUIComponentProps<FieldsetRootState> {
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean
}

/**
 * Groups a shared legend with related controls.
 * Renders a \`<fieldset>\` element.
 *
 * Documentation: [Base UI Vue Fieldset](https://baseui-vue.com/components/fieldset)
 */
defineOptions({
  name: 'FieldsetRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FieldsetRootProps>(), {
  as: 'fieldset',
  disabled: false,
})

const attrs = useAttrs()

const legendId = ref<string | undefined>(undefined)

function setLegendId(id: string | undefined) {
  legendId.value = id
}

const disabled = computed(() => props.disabled ?? false)

const state = computed<FieldsetRootState>(() => ({
  disabled: disabled.value,
}))

provide(fieldsetRootContextKey, {
  legendId,
  setLegendId,
  disabled,
})

const { tag, mergedProps, renderless } = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => ({
    ...attrs,
    'aria-labelledby': legendId.value,
  })),
  defaultTagName: 'fieldset',
})
</script>

<template>
  <slot v-if="renderless" :props="mergedProps" :state="state" />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
