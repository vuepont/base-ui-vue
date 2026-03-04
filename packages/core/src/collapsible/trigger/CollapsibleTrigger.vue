<script setup lang="ts">
import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { CollapsibleRootState, CollapsibleTriggerProps } from '../collapsible.types'
import { computed, useAttrs } from 'vue'
import { useButton } from '../../use-button'
import { triggerOpenStateMapping } from '../../utils/collapsibleOpenStateMapping'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
import { transitionStatusMapping } from '../../utils/stateAttributesMapping'
import { useCollapsibleRootContext } from '../root/CollapsibleRootContext'

defineOptions({
  name: 'CollapsibleTrigger',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CollapsibleTriggerProps>(), {
  as: 'button',
  nativeButton: true,
})

const triggerStateAttributesMapping: StateAttributesMapping<CollapsibleRootState> = {
  ...triggerOpenStateMapping,
  ...transitionStatusMapping,
}

const attrs = useAttrs()

const ctx = useCollapsibleRootContext()

const disabled = computed(() => props.disabled ?? ctx.disabled.value)

const { getButtonProps, buttonRef } = useButton({
  disabled: () => disabled.value,
  focusableWhenDisabled: () => true,
  native: () => props.nativeButton ?? true,
})

const mergedProps = computed(() => {
  const state = ctx.state.value
  const stateAttributes = getStateAttributesProps(state, triggerStateAttributesMapping)

  const buttonProps = getButtonProps({
    ...attrs as Record<string, any>,
    'aria-controls': ctx.open.value ? ctx.panelId.value : undefined,
    'aria-expanded': ctx.open.value,
    'onClick': ctx.handleTrigger,
    'class': typeof props.class === 'function' ? props.class(state) : props.class,
    'style': typeof props.style === 'function' ? props.style(state) : props.style,
    ...stateAttributes,
  })

  return buttonProps
})
</script>

<template>
  <component :is="props.as" ref="buttonRef" v-bind="mergedProps">
    <slot />
  </component>
</template>
