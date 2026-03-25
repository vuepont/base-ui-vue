<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { ToolbarRootState } from '../root/ToolbarRoot.vue'
import { computed, provide, useAttrs } from 'vue'
import { useRenderElement } from '../../utils/useRenderElement'
import { useToolbarRootContext } from '../root/ToolbarRootContext'
import { toolbarGroupContextKey } from './ToolbarGroupContext'

export interface ToolbarGroupState extends ToolbarRootState {}

export interface ToolbarGroupProps extends BaseUIComponentProps<ToolbarGroupState> {
  /**
   * Whether all toolbar items in the group are disabled.
   * @default false
   */
  disabled?: boolean
}

/**
 * Groups several toolbar items or toggles.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Toolbar](https://baseui-vue.com/docs/components/toolbar)
 */
defineOptions({
  name: 'ToolbarGroup',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ToolbarGroupProps>(), {
  as: 'div',
  disabled: false,
})

const attrs = useAttrs()
const toolbarRootContext = useToolbarRootContext()

const disabled = computed(() => toolbarRootContext.disabled.value || props.disabled)

provide(toolbarGroupContextKey, {
  disabled,
})

const state = computed<ToolbarGroupState>(() => ({
  disabled: disabled.value,
  orientation: toolbarRootContext.orientation.value,
}))

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
    role: 'group',
  })),
  defaultTagName: 'div',
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
