<script setup lang="ts">
import type { CollapsibleChangeEventDetails, CollapsibleRootState } from '../../collapsible/collapsible.types'
import type { AccordionItemChangeEventDetails, AccordionItemProps, AccordionItemState } from '../accordion.types'
import { computed, provide, ref, useAttrs } from 'vue'
import { collapsibleRootContextKey } from '../../collapsible/root/CollapsibleRootContext'
import { useCollapsibleRoot } from '../../collapsible/root/useCollapsibleRoot'
import { useCompositeListItem } from '../../composite/list/useCompositeListItem'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { useRenderElement } from '../../utils/useRenderElement'
import { useAccordionRootContext } from '../root/AccordionRootContext'
import { accordionItemContextKey } from './AccordionItemContext'
import { accordionStateAttributesMapping } from './stateAttributesMapping'

defineOptions({
  name: 'AccordionItem',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<AccordionItemProps>(), {
  as: 'div',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'openChange', open: boolean, details: AccordionItemChangeEventDetails): void
}>()

const attrs = useAttrs()
const rootCtx = useAccordionRootContext()

const { ref: listItemRef, index } = useCompositeListItem()

const fallbackValue = useBaseUiId()
const itemValue = computed(() => props.value ?? fallbackValue)
const disabled = computed(() => props.disabled || rootCtx.disabled.value)

const isOpen = computed(() => {
  const values = rootCtx.value.value
  if (!values) {
    return false
  }
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === itemValue.value) {
      return true
    }
  }
  return false
})

function onOpenChange(nextOpen: boolean, eventDetails: CollapsibleChangeEventDetails) {
  emit('openChange', nextOpen, eventDetails as AccordionItemChangeEventDetails)
  if (eventDetails.isCanceled) {
    return
  }
  rootCtx.handleValueChange(itemValue.value, nextOpen)
}

const collapsible = useCollapsibleRoot({
  open: () => isOpen.value,
  isOpenControlled: () => true,
  defaultOpen: false,
  onOpenChange,
  disabled: () => disabled.value,
})

const collapsibleState = computed<CollapsibleRootState>(() => ({
  open: collapsible.open.value,
  disabled: collapsible.disabled.value,
  transitionStatus: collapsible.transitionStatus.value,
}))

const state = computed<AccordionItemState>(() => ({
  ...rootCtx.state.value,
  index: index.value,
  disabled: disabled.value,
  open: isOpen.value,
}))

const triggerId = ref<string | undefined>(useBaseUiId())

function setTriggerId(id: string | undefined) {
  triggerId.value = id
}

provide(collapsibleRootContextKey, {
  ...collapsible,
  onOpenChange,
  state: collapsibleState,
})

provide(accordionItemContextKey, {
  open: isOpen,
  state,
  setTriggerId,
  triggerId,
})

const itemRef = ref<HTMLElement | null>(null)
const mergedRef = useMergedRefs(itemRef, listItemRef)

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => ({
    ...attrs,
  })),
  stateAttributesMapping: accordionStateAttributesMapping,
  defaultTagName: 'div',
  ref: mergedRef,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
