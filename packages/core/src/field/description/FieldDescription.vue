<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { FieldRootState } from '../root/FieldRoot.vue'
import { computed, useAttrs, watchEffect } from 'vue'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
import { useBaseUiId } from '../../utils/useBaseUiId'
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

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(fieldRootContext.state.value, fieldValidityMapping)
  return {
    ...attrs,
    id: id.value,
    class: typeof props.class === 'function' ? props.class(fieldRootContext.state.value) : props.class,
    style: typeof props.style === 'function' ? props.style(fieldRootContext.state.value) : props.style,
    ...stateAttributes,
  }
})
</script>

<template>
  <component :is="props.as" v-bind="mergedProps">
    <slot />
  </component>
</template>
