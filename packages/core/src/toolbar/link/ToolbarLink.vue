<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import { computed, useAttrs } from 'vue'
import CompositeItem from '../../composite/item/CompositeItem.vue'
import { useToolbarRootContext } from '../root/ToolbarRootContext'

/**
 * A link component.
 * Renders an `<a>` element.
 *
 * Documentation: [Base UI Vue Toolbar](https://baseui-vue.com/docs/components/toolbar)
 */
defineOptions({
  name: 'ToolbarLink',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ToolbarLinkProps>(), {
  as: 'a',
})

const TOOLBAR_LINK_METADATA = {
  focusableWhenDisabled: true,
}

export interface ToolbarLinkState {
  /**
   * The component orientation.
   */
  orientation: 'horizontal' | 'vertical'
}

export interface ToolbarLinkProps extends BaseUIComponentProps<ToolbarLinkState> {}

const attrs = useAttrs()
const toolbarRootContext = useToolbarRootContext()

const state = computed<ToolbarLinkState>(() => ({
  orientation: toolbarRootContext.orientation.value,
}))
</script>

<template>
  <CompositeItem
    :as="as"
    :class="props.class"
    :style="props.style"
    :metadata="TOOLBAR_LINK_METADATA"
    :state="state"
    :props="[attrs]"
  >
    <slot :state="state" />
  </CompositeItem>
</template>
