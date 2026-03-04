<script setup lang="ts">
import type { AccordionHeaderProps } from '../accordion.types'
import { computed, useAttrs } from 'vue'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
import { useAccordionItemContext } from '../item/AccordionItemContext'
import { accordionStateAttributesMapping } from '../item/stateAttributesMapping'

defineOptions({
  name: 'AccordionHeader',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<AccordionHeaderProps>(), {
  as: 'h3',
})

const attrs = useAttrs()
const { state } = useAccordionItemContext()

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(state.value, accordionStateAttributesMapping)
  return {
    ...attrs,
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
