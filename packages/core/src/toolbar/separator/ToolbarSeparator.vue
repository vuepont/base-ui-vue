<script setup lang="ts">
import type { SeparatorProps, SeparatorState } from '../../separator/Separator.vue'
import { computed, useAttrs } from 'vue'
import Separator from '../../separator/Separator.vue'
import { useToolbarRootContext } from '../root/ToolbarRootContext'

export interface ToolbarSeparatorState extends SeparatorState {}

export interface ToolbarSeparatorProps extends SeparatorProps {}

/**
 * A separator element accessible to screen readers.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Toolbar](https://baseui-vue.com/docs/components/toolbar)
 */
defineOptions({
  name: 'ToolbarSeparator',
  inheritAttrs: false,
})

const props = defineProps<ToolbarSeparatorProps>()
const attrs = useAttrs()
const toolbarRootContext = useToolbarRootContext()

const orientation = computed(() => props.orientation
  ?? (toolbarRootContext.orientation.value === 'vertical' ? 'horizontal' : 'vertical'))
</script>

<template>
  <Separator
    v-slot="slotProps"
    :as="props.as"
    :class="props.class"
    :style="props.style"
    :orientation="orientation"
    v-bind="attrs"
  >
    <slot v-bind="slotProps" />
  </Separator>
</template>
