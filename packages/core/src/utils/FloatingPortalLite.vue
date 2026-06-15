<script setup lang="ts">
import type { FloatingPortal } from '../floating-ui-vue'
import { computed, useAttrs } from 'vue'
import { useFloatingPortalNode } from '../floating-ui-vue'

defineOptions({
  name: 'FloatingPortalLite',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FloatingPortalLiteProps>(), {
  as: 'div',
  disabled: false,
})

const attrs = useAttrs()

const state = computed<FloatingPortalLiteState>(() => ({}))

const {
  portalNode,
  portalTarget,
  shouldRender,
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useFloatingPortalNode({
  container: () => props.container,
  to: () => props.to,
  componentProps: props,
  elementProps: computed(() => attrs),
  state,
})

defineExpose({
  element: portalNode,
})
</script>

<script lang="ts">
export interface FloatingPortalLiteState {}

export interface FloatingPortalLiteProps
  extends FloatingPortal.Props<FloatingPortalLiteState> {
  /**
   * Vue Teleport target. Prefer `container` for React API parity.
   * @default 'body'
   */
  to?: FloatingPortal.Target
  /**
   * Disables Vue Teleport while preserving portal mounting behavior.
   * @default false
   */
  disabled?: boolean
}
</script>

<template>
  <Teleport v-if="shouldRender" :to="portalTarget" :disabled="disabled">
    <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
    <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
      <slot :state="state" />
    </component>
  </Teleport>
</template>
