<script setup lang="ts">
import type { BaseUIComponentProps, NativeButtonProps } from '../../utils/types'
import type { ToolbarRootState } from '../root/ToolbarRoot.vue'
import { computed, useAttrs } from 'vue'
import CompositeItem from '../../composite/item/CompositeItem.vue'
import { useButton } from '../../use-button'
import { useToolbarGroupContext } from '../group/ToolbarGroupContext'
import { useToolbarRootContext } from '../root/ToolbarRootContext'

export interface ToolbarButtonState extends ToolbarRootState {
  /**
   * Whether the component is disabled.
   */
  disabled: boolean
  /**
   * Whether the component remains focusable when disabled.
   */
  focusable: boolean
}

export interface ToolbarButtonProps
  extends NativeButtonProps,
  BaseUIComponentProps<ToolbarButtonState> {
  /**
   * Whether the component is disabled.
   * @default false
   */
  disabled?: boolean
  /**
   * Whether the component remains focusable when disabled.
   * @default true
   */
  focusableWhenDisabled?: boolean
}

/**
 * A button that can be used as-is or as a trigger for other components.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Vue Toolbar](https://baseui-vue.com/docs/components/toolbar)
 */
defineOptions({
  name: 'ToolbarButton',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ToolbarButtonProps>(), {
  as: 'button',
  disabled: false,
  focusableWhenDisabled: true,
  nativeButton: true,
})

const attrs = useAttrs()
const toolbarRootContext = useToolbarRootContext()
const toolbarGroupContext = useToolbarGroupContext(true)

const disabled = computed(() =>
  toolbarRootContext.disabled.value
  || (toolbarGroupContext?.disabled.value ?? false)
  || props.disabled,
)

const { getButtonProps, buttonRef } = useButton({
  disabled,
  focusableWhenDisabled: () => props.focusableWhenDisabled,
  native: () => props.nativeButton ?? true,
})

const state = computed<ToolbarButtonState>(() => ({
  disabled: disabled.value,
  orientation: toolbarRootContext.orientation.value,
  focusable: props.focusableWhenDisabled,
}))

const itemRefs = [buttonRef]
const componentProps = computed(() =>
  typeof props.as === 'string'
    ? {}
    : { disabled: disabled.value },
)
</script>

<template>
  <CompositeItem
    :as="as"
    :class="props.class"
    :style="props.style"
    :metadata="{ focusableWhenDisabled }"
    :state="state"
    :refs="itemRefs"
    :props="[
      componentProps,
      () => getButtonProps(attrs as Record<string, any>),
    ]"
  >
    <slot :state="state" />
  </CompositeItem>
</template>
