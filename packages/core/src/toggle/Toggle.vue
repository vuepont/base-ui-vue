<script setup lang="ts" generic="Value extends string = string">
import type { BaseUIChangeEventDetails } from '../utils/createBaseUIEventDetails'
import type { BaseUIComponentProps, NativeButtonProps } from '../utils/types'
import { computed, getCurrentInstance, useAttrs, watchEffect } from 'vue'
import CompositeItem from '../composite/item/CompositeItem.vue'
import { mergeProps } from '../merge-props'
import { useToggleGroupContext } from '../toggle-group/ToggleGroupContext'
import { useButton } from '../use-button'
import { createChangeEventDetails } from '../utils/createBaseUIEventDetails'
import { error } from '../utils/error'
import { REASONS } from '../utils/reasons'
import { useBaseUiId } from '../utils/useBaseUiId'
import { useControllableState } from '../utils/useControllableState'
import { useRenderElement } from '../utils/useRenderElement'

export interface ToggleState {
  /**
   * Whether the toggle is currently pressed.
   */
  pressed: boolean
  /**
   * Whether the toggle should ignore user interaction.
   */
  disabled: boolean
}

export interface ToggleProps<Value extends string = string>
  extends NativeButtonProps, BaseUIComponentProps<ToggleState> {
  /**
   * Whether the toggle button is currently pressed.
   * This is the controlled counterpart of `defaultPressed`.
   */
  pressed?: boolean
  /**
   * Whether the toggle button is initially pressed.
   * This is the uncontrolled counterpart of `pressed`.
   * @default false
   */
  defaultPressed?: boolean
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean
  /**
   * A unique string that identifies the toggle when used inside a toggle group.
   */
  value?: Value | undefined
}

/**
 * A two-state button that can be on or off.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Vue Toggle](https://baseui-vue.com/docs/components/toggle)
 */
defineOptions({
  name: 'Toggle',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ToggleProps<Value>>(), {
  as: 'button',
  defaultPressed: false,
  disabled: false,
  nativeButton: true,
})

const emit = defineEmits<{
  /**
   * Event handler called when the pressed state changes.
   */
  pressedChange: [
    pressed: boolean,
    eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
  ]
}>()

const attrs = useAttrs()
const instance = getCurrentInstance()
const groupContext = useToggleGroupContext<Value>(true)

const generatedValue = useBaseUiId()
const toggleValue = computed(
  () => (props.value || generatedValue) as Value | undefined,
)
const groupValue = computed(() => groupContext?.value.value ?? [])

const disabled = computed(
  () => props.disabled || (groupContext?.disabled.value ?? false),
)

if (process.env.NODE_ENV !== 'production') {
  watchEffect(() => {
    if (
      groupContext
      && props.value === undefined
      && groupContext.isValueInitialized.value
    ) {
      error(
        'A `<Toggle>` component rendered in a `<ToggleGroup>` has no explicit `value` prop.',
        'This will cause issues between the Toggle Group and Toggle values.',
        'Provide the `<Toggle>` with a `value` prop matching the `<ToggleGroup>` values prop type.',
      )
    }
  })
}

const hasPressedProp = computed(() =>
  Boolean(instance?.vnode.props && Object.prototype.hasOwnProperty.call(instance.vnode.props, 'pressed')),
)

const { value: pressed, setValue: setPressedState } = useControllableState<boolean>({
  controlled: () => {
    if (groupContext) {
      return toggleValue.value !== undefined && groupValue.value.includes(toggleValue.value)
    }

    return hasPressedProp.value ? props.pressed : undefined
  },
  default: () => props.defaultPressed,
  name: 'Toggle',
  state: 'pressed',
})

function emitPressedChange(
  nextPressed: boolean,
  eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
) {
  if (toggleValue.value !== undefined) {
    groupContext?.setGroupValue(toggleValue.value, nextPressed, eventDetails)
  }

  emit('pressedChange', nextPressed, eventDetails)
}

const { getButtonProps, buttonRef } = useButton({
  disabled,
  native: () => props.nativeButton ?? true,
})

const state = computed<ToggleState>(() => ({
  disabled: disabled.value,
  pressed: pressed.value,
}))

const buttonAttrs = computed(() => {
  const { form: _form, type: _type, ...rest } = attrs as Record<string, any>
  return rest
})

function createToggleButtonProps() {
  return mergeProps(
    getButtonProps(mergeProps(
      buttonAttrs.value,
      {
        'aria-pressed': pressed.value,
        onClick(event: MouseEvent) {
          const nextPressed = !pressed.value
          const details = createChangeEventDetails(REASONS.none, event)

          emitPressedChange(nextPressed, details)

          if (details.isCanceled) {
            return
          }

          setPressedState(nextPressed)
        },
      },
    )),
    groupContext
      ? { 'aria-disabled': disabled.value ? 'true' : 'false' }
      : undefined,
  )
}

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => createToggleButtonProps()),
  defaultTagName: 'button',
  ref: buttonRef,
})

const itemRefs = [buttonRef]
</script>

<template>
  <CompositeItem
    v-if="groupContext"
    v-slot="slotProps"
    :as="as"
    :class="props.class"
    :style="props.style"
    :state="state"
    :refs="itemRefs"
    :props="[() => createToggleButtonProps()]"
  >
    <slot v-bind="slotProps" />
  </CompositeItem>
  <slot v-else-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
