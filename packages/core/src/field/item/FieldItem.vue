<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { FieldRootState } from '../root/FieldRoot.vue'
import type { FieldItemContext } from './FieldItemContext'
import { computed, provide, useAttrs } from 'vue'
import { useCheckboxGroupContext } from '../../checkbox-group/CheckboxGroupContext'
import LabelableProvider from '../../labelable-provider/LabelableProvider.vue'
import { useRenderElement } from '../../utils/useRenderElement'
import { useFieldRootContext } from '../root/FieldRootContext'
import { fieldValidityMapping } from '../utils/constants'
import { fieldItemContextKey } from './FieldItemContext'

export type FieldItemState = FieldRootState

export interface FieldItemProps extends BaseUIComponentProps<FieldItemState> {
  /**
   * Whether the wrapped control should ignore user interaction.
   * The `disabled` prop on `<FieldRoot>` takes precedence over this.
   * @default false
   */
  disabled?: boolean
}

defineOptions({
  name: 'FieldItem',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FieldItemProps>(), {
  as: 'div',
  disabled: false,
})

const attrs = useAttrs()

const { state, disabled: rootDisabled } = useFieldRootContext(false)

const disabled = computed(() => rootDisabled.value || props.disabled)
const checkboxGroupContext = useCheckboxGroupContext(true)
const parentId = computed(() => checkboxGroupContext?.parent.id)
const hasParentCheckbox = computed(() => checkboxGroupContext?.allValues.value !== undefined)
const controlId = computed(() => (hasParentCheckbox.value ? parentId.value : undefined))

const contextValue: FieldItemContext = {
  disabled,
}

provide(fieldItemContextKey, contextValue)

const { tag, mergedProps, renderless } = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => ({
    ...attrs,
  })),
  stateAttributesMapping: fieldValidityMapping,
  defaultTagName: 'div',
})
</script>

<template>
  <LabelableProvider :control-id="controlId">
    <slot v-if="renderless" :props="mergedProps" :state="state" />
    <component :is="tag" v-else v-bind="mergedProps">
      <slot :state="state" />
    </component>
  </LabelableProvider>
</template>
