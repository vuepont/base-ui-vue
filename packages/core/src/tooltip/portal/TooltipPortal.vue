<script setup lang="ts">
import { computed, provide, toRef } from 'vue'
import { useTooltipRootContext } from '../root/TooltipRootContext'
import { tooltipPortalContextKey } from './TooltipPortalContext'

defineOptions({
  name: 'TooltipPortal',
})

const props = withDefaults(defineProps<TooltipPortalProps>(), {
  keepMounted: false,
  to: 'body',
  disabled: false,
})

const ctx = useTooltipRootContext()
const keepMounted = toRef(props, 'keepMounted')
const shouldRender = computed(() => ctx.mounted.value || props.keepMounted)

provide(tooltipPortalContextKey, keepMounted)
</script>

<script lang="ts">
export interface TooltipPortalState {}

export interface TooltipPortalProps {
  /**
   * Whether to keep the portal mounted in the DOM while the popup is hidden.
   * @default false
   */
  keepMounted?: boolean
  /**
   * Teleport target.
   * @default 'body'
   */
  to?: string | HTMLElement
  /**
   * Disables Vue Teleport while preserving tooltip mounting behavior.
   * @default false
   */
  disabled?: boolean
}
</script>

<template>
  <Teleport v-if="shouldRender" :to="to" :disabled="disabled">
    <slot />
  </Teleport>
</template>
