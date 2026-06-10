<script setup lang="ts">
import type { TooltipPortalProps } from '../tooltip.types'
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

<template>
  <Teleport v-if="shouldRender" :to="to" :disabled="disabled">
    <slot />
  </Teleport>
</template>
