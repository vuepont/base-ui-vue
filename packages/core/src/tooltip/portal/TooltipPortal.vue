<script setup lang="ts">
import type { FloatingPortal } from '../../floating-ui-vue'
import type { BaseUIComponentProps } from '../../utils/types'
import { computed, provide, shallowRef, toRef, unref, useAttrs } from 'vue'
import FloatingPortalLite from '../../utils/FloatingPortalLite.vue'
import { useTooltipRootContext } from '../root/TooltipRootContext'
import { tooltipPortalContextKey } from './TooltipPortalContext'

/**
 * A portal element that moves the popup to a different part of the DOM.
 * By default, the portal element is appended to `<body>`.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Tooltip](https://baseui-vue.com/docs/components/tooltip)
 */
defineOptions({
  name: 'TooltipPortal',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipPortalProps>(), {
  keepMounted: false,
  disabled: false,
})

const attrs = useAttrs()
const ctx = useTooltipRootContext()
const keepMounted = toRef(props, 'keepMounted')
const shouldRender = computed(() => ctx.mounted.value || props.keepMounted)
const portalRef = shallowRef<{
  element?: HTMLElement | null
} | null>(null)
const element = computed(() => unref(portalRef.value?.element) ?? null)

provide(tooltipPortalContextKey, keepMounted)

defineExpose({
  element,
})
</script>

<script lang="ts">
export interface TooltipPortalState {}

export interface TooltipPortalProps
  extends BaseUIComponentProps<TooltipPortalState> {
  /**
   * Whether to keep the portal mounted in the DOM while the popup is hidden.
   * @default false
   */
  keepMounted?: boolean
  /**
   * A parent element to render the portal element into.
   */
  container?: FloatingPortal.Container
  /**
   * Teleport target.
   * @default 'body'
   */
  to?: FloatingPortal.Target
  /**
   * Disables Vue Teleport while preserving tooltip mounting behavior.
   * @default false
   */
  disabled?: boolean
}
</script>

<template>
  <FloatingPortalLite
    v-if="shouldRender"
    ref="portalRef"
    :as="props.as"
    :class="props.class"
    :style="props.style"
    :container="props.container"
    :to="props.to"
    :disabled="props.disabled"
    v-bind="attrs"
  >
    <slot />
  </FloatingPortalLite>
</template>
