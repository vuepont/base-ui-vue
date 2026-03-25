<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { ToolbarRootState } from '../root/ToolbarRoot.vue'
import { computed, useAttrs } from 'vue'
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, stopEvent } from '../../composite/composite'
import CompositeItem from '../../composite/item/CompositeItem.vue'
import { useFocusableWhenDisabled } from '../../utils/useFocusableWhenDisabled'
import { useToolbarGroupContext } from '../group/ToolbarGroupContext'
import { useToolbarRootContext } from '../root/ToolbarRootContext'

export interface ToolbarInputState extends ToolbarRootState {
  /**
   * Whether the component is disabled.
   */
  disabled: boolean
  /**
   * Whether the component remains focusable when disabled.
   */
  focusable: boolean
}

export interface ToolbarInputProps extends BaseUIComponentProps<ToolbarInputState> {
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
  defaultValue?: string | number
}

/**
 * A native input element that integrates with Toolbar keyboard navigation.
 * Renders an `<input>` element.
 *
 * Documentation: [Base UI Vue Toolbar](https://baseui-vue.com/docs/components/toolbar)
 */
defineOptions({
  name: 'ToolbarInput',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ToolbarInputProps>(), {
  as: 'input',
  disabled: false,
  focusableWhenDisabled: true,
})

const attrs = useAttrs()
const toolbarRootContext = useToolbarRootContext()
const toolbarGroupContext = useToolbarGroupContext(true)

const disabled = computed(() =>
  toolbarRootContext.disabled.value
  || (toolbarGroupContext?.disabled.value ?? false)
  || props.disabled,
)

const { props: focusableWhenDisabledProps } = useFocusableWhenDisabled({
  composite: true,
  disabled,
  focusableWhenDisabled: () => props.focusableWhenDisabled,
  isNativeButton: false,
})

const state = computed<ToolbarInputState>(() => ({
  disabled: disabled.value,
  orientation: toolbarRootContext.orientation.value,
  focusable: props.focusableWhenDisabled,
}))

const allowedKeysWhenDisabled = computed(() =>
  toolbarRootContext.orientation.value === 'vertical'
    ? new Set([ARROW_UP, ARROW_DOWN])
    : new Set([ARROW_LEFT, ARROW_RIGHT]),
)

const defaultProps = computed(() => ({
  onClick(event: MouseEvent) {
    if (disabled.value) {
      event.preventDefault()
    }
  },
  onKeydown(event: KeyboardEvent) {
    if (disabled.value && !allowedKeysWhenDisabled.value.has(event.key)) {
      stopEvent(event)
    }
  },
  onPointerdown(event: PointerEvent) {
    if (disabled.value) {
      event.preventDefault()
    }
  },
}))
</script>

<template>
  <CompositeItem
    :as="as"
    :class="props.class"
    :style="props.style"
    :metadata="{ focusableWhenDisabled }"
    :state="state"
    :props="[
      defaultProps,
      attrs as Record<string, any>,
      () => focusableWhenDisabledProps,
    ]"
  />
</template>
