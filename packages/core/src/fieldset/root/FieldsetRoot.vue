<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import { computed, provide, ref, useAttrs } from 'vue'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
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

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(state.value)
  return {
    ...attrs,
    'aria-labelledby': legendId.value,
    'class': typeof props.class === 'function' ? props.class(state.value) : props.class,
    'style': typeof props.style === 'function' ? props.style(state.value) : props.style,
    ...stateAttributes,
  }
})
</script>

<template>
  <component :is="props.as" v-bind="mergedProps">
    <slot />
  </component>
</template>
