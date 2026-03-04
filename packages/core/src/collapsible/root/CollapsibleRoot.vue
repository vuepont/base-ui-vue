<script setup lang="ts">
import type { CollapsibleChangeEventDetails, CollapsibleRootProps } from '../collapsible.types'
import { computed, getCurrentInstance, provide, useAttrs } from 'vue'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
import { collapsibleRootContextKey } from './CollapsibleRootContext'
import { collapsibleStateAttributesMapping } from './stateAttributesMapping'
import { useCollapsibleRoot } from './useCollapsibleRoot'

defineOptions({
  name: 'CollapsibleRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CollapsibleRootProps>(), {
  as: 'div',
  defaultOpen: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'openChange', open: boolean, details: CollapsibleChangeEventDetails): void
}>()

const attrs = useAttrs()
const instance = getCurrentInstance()

const isOpenControlled = computed(() => {
  const vnodeProps = instance?.vnode.props as Record<string, unknown> | null | undefined
  return Boolean(vnodeProps && 'open' in vnodeProps)
})

const collapsible = useCollapsibleRoot({
  open: () => props.open,
  isOpenControlled: () => isOpenControlled.value,
  defaultOpen: props.defaultOpen ?? false,
  onOpenChange: (open, details) => emit('openChange', open, details),
  disabled: () => props.disabled ?? false,
})

const state = collapsible.state

provide(collapsibleRootContextKey, collapsible)

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(state.value, collapsibleStateAttributesMapping)
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
