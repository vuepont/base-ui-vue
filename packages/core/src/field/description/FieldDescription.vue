<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { FieldRootState } from '../root/FieldRoot.vue'
import { computed, useAttrs, watchEffect } from 'vue'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useRenderElement } from '../../utils/useRenderElement'
import { useFieldRootContext } from '../root/FieldRootContext'
import { fieldValidityMapping } from '../utils/constants'

export type FieldDescriptionState = FieldRootState

export interface FieldDescriptionProps extends BaseUIComponentProps<FieldDescriptionState> {
  /**
   * The `id` attribute of the description element.
   */
  id?: string
}

defineOptions({
  name: 'FieldDescription',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FieldDescriptionProps>(), {
  as: 'p',
})

const attrs = useAttrs()

const generatedId = useBaseUiId(undefined)
const id = computed(() => props.id ?? generatedId)

const fieldRootContext = useFieldRootContext(false)
const { setMessageIds } = useLabelableContext()

watchEffect((onCleanup) => {
  const currentId = id.value
  if (currentId) {
    setMessageIds(ids => ids.concat(currentId))
    onCleanup(() => setMessageIds(ids => ids.filter(item => item !== currentId)))
  }
})

const { tag, mergedProps, renderless } = useRenderElement({
  componentProps: props,
  state: fieldRootContext.state,
  props: computed(() => ({
    ...attrs,
    id: id.value,
  })),
  stateAttributesMapping: fieldValidityMapping,
  defaultTagName: 'p',
})
</script>

<template>
  <slot v-if="renderless" :props="mergedProps" :state="fieldRootContext.state" />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot :state="fieldRootContext.state" />
  </component>
</template>
