<script setup lang="ts">
import type { AccordionHeaderProps } from '../accordion.types'
import { computed, useAttrs } from 'vue'
import { useRenderElement } from '../../utils/useRenderElement'
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

const { tag, mergedProps, renderless } = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => ({
    ...attrs,
  })),
  stateAttributesMapping: accordionStateAttributesMapping,
  defaultTagName: 'h3',
})
</script>

<template>
  <slot v-if="renderless" :props="mergedProps" :state="state" />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
