<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { FieldRootState } from '../root/FieldRoot.vue'
import type { FieldItemContext } from './FieldItemContext'
import { computed, provide, useAttrs } from 'vue'
import LabelableProvider from '../../labelable-provider/LabelableProvider.vue'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
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

const contextValue: FieldItemContext = {
  disabled,
}

provide(fieldItemContextKey, contextValue)

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(state.value, fieldValidityMapping)

  return {
    ...attrs,
    class: typeof props.class === 'function' ? props.class(state.value) : props.class,
    style: typeof props.style === 'function' ? props.style(state.value) : props.style,
    ...stateAttributes,
  }
})
</script>

<template>
  <LabelableProvider>
    <component :is="props.as" v-bind="mergedProps">
      <slot />
    </component>
  </LabelableProvider>
</template>
