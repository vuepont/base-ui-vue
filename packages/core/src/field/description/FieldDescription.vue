<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { FieldRootState } from '../root/FieldRoot.vue'
import { computed, onMounted, onUnmounted, useAttrs } from 'vue'
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

const id = useBaseUiId(props.id)

const fieldRootContext = useFieldRootContext(false)
const { setMessageIds } = useLabelableContext()

onMounted(() => {
  if (id) {
    setMessageIds(ids => ids.concat(id))
  }
})

onUnmounted(() => {
  if (id) {
    setMessageIds(ids => ids.filter(item => item !== id))
  }
})

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(fieldRootContext.state.value, fieldValidityMapping)
  return {
    ...attrs,
    id,
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
