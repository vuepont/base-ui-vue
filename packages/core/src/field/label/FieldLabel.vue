<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { FieldRootState } from '../root/FieldRoot.vue'
import { computed, useAttrs } from 'vue'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { useLabel } from '../../labelable-provider/useLabel'
import { useRenderElement } from '../../utils/useRenderElement'
import { useFieldRootContext } from '../root/FieldRootContext'
import { fieldValidityMapping } from '../utils/constants'

export type FieldLabelState = FieldRootState

export interface FieldLabelProps extends BaseUIComponentProps<FieldLabelState> {
  /**
   * The `id` attribute of the label element.
   */
  id?: string
  /**
   * Whether the component renders a native `<label>` element.
   * @default true
   */
  nativeLabel?: boolean
}

defineOptions({
  name: 'FieldLabel',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FieldLabelProps>(), {
  as: 'label',
  nativeLabel: true,
})

const attrs = useAttrs()

const fieldRootContext = useFieldRootContext(false)
const { labelId } = useLabelableContext()
const label = useLabel({
  id: computed(() => labelId.value ?? props.id),
  native: computed(() => props.nativeLabel),
})

const { tag, mergedProps, renderless } = useRenderElement({
  componentProps: props,
  state: fieldRootContext.state,
  props: computed(() => ({
    ...attrs,
    ...label.props.value,
  })),
  stateAttributesMapping: fieldValidityMapping,
  defaultTagName: 'label',
})
</script>

<template>
  <slot v-if="renderless" :props="mergedProps" :state="fieldRootContext.state" />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot :state="fieldRootContext.state" />
  </component>
</template>
