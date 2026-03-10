<script setup lang="ts">
import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { CollapsibleRootState, CollapsibleTriggerProps } from '../collapsible.types'
import { computed, useAttrs } from 'vue'
import { useButton } from '../../use-button'
import { triggerOpenStateMapping } from '../../utils/collapsibleOpenStateMapping'
import { transitionStatusMapping } from '../../utils/stateAttributesMapping'
import { useRenderElement } from '../../utils/useRenderElement'
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

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state: ctx.state,
  props: computed(() => getButtonProps({
    ...attrs as Record<string, any>,
    'aria-controls': ctx.open.value ? ctx.panelId.value : undefined,
    'aria-expanded': ctx.open.value,
    'onClick': ctx.handleTrigger,
  })),
  stateAttributesMapping: triggerStateAttributesMapping,
  defaultTagName: 'button',
  ref: buttonRef,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="ctx.state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="ctx.state" />
  </component>
</template>
