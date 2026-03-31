<script setup lang="ts" generic="Value extends string = string">
import type { BaseUIChangeEventDetails } from '../utils/createBaseUIEventDetails'
import type { StateAttributesMapping } from '../utils/getStateAttributesProps'
import type { REASONS } from '../utils/reasons'
import type { BaseUIComponentProps, HTMLProps, Orientation } from '../utils/types'
import { computed, provide, useAttrs } from 'vue'
import CompositeRoot from '../composite/root/CompositeRoot.vue'
import { useToolbarRootContext } from '../toolbar/root/ToolbarRootContext'
import { useControllableState } from '../utils/useControllableState'
import { useRenderElement } from '../utils/useRenderElement'
import { toggleGroupContextKey } from './ToggleGroupContext'
import { ToggleGroupDataAttributes } from './ToggleGroupDataAttributes'

export interface ToggleGroupState {
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean
  /**
   * When `false` only one item in the group can be pressed. If any item in
   * the group becomes pressed, the others will become unpressed.
   * When `true` multiple items can be pressed.
   * @default false
   */
  multiple: boolean
  /**
   * The orientation of the toggle group.
   */
  orientation: Orientation
}

export interface ToggleGroupProps<Value extends string = string>
  extends BaseUIComponentProps<ToggleGroupState> {
  /**
   * The pressed values of the toggle group.
   * This is the controlled counterpart of `defaultValue`.
   */
  value?: Value[]
  /**
   * The pressed values of the toggle group.
   * This is the uncontrolled counterpart of `value`.
   */
  defaultValue?: Value[]
  /**
   * Whether the toggle group should ignore user interaction.
   * @default false
   */
  disabled?: boolean
  /**
   * The orientation of the toggle group.
   * @default 'horizontal'
   */
  orientation?: Orientation
  /**
   * Whether to loop keyboard focus back to the first item when the end of the list is reached.
   * @default true
   */
  loopFocus?: boolean
  /**
   * When `false` only one item in the group can be pressed. If any item in
   * the group becomes pressed, the others will become unpressed.
   * When `true` multiple items can be pressed.
   * @default false
   */
  multiple?: boolean
}

/**
 * Provides a shared state to a series of toggle buttons.
 *
 * Documentation: [Base UI Vue Toggle Group](https://baseui-vue.com/docs/components/toggle-group)
 */
defineOptions({
  name: 'ToggleGroup',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ToggleGroupProps<Value>>(), {
  as: 'div',
  disabled: false,
  orientation: 'horizontal',
  loopFocus: true,
  multiple: false,
})

const emit = defineEmits<{
  /**
   * Event handler called when the group value changes.
   */
  valueChange: [
    value: Value[],
    eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
  ]
}>()

const attrs = useAttrs()
const attrsObject = attrs as Record<string, unknown>
const toolbarContext = useToolbarRootContext(true)

const disabled = computed(
  () => (toolbarContext?.disabled.value ?? false) || props.disabled,
)

const isValueInitialized = computed(
  () => props.value !== undefined || props.defaultValue !== undefined,
)

const { value: groupValue, setValue: setValueState } = useControllableState<Value[]>({
  controlled: () => props.value,
  default: () => (props.value === undefined ? (props.defaultValue ?? []) : []),
  name: 'ToggleGroup',
})

function setGroupValue(
  newValue: Value,
  nextPressed: boolean,
  eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
) {
  let newGroupValue: Value[]

  if (props.multiple) {
    newGroupValue = groupValue.value.slice()

    if (nextPressed) {
      newGroupValue.push(newValue)
    }
    else {
      const valueIndex = groupValue.value.indexOf(newValue)

      if (valueIndex >= 0) {
        newGroupValue.splice(valueIndex, 1)
      }
    }
  }
  else {
    newGroupValue = nextPressed ? [newValue] : []
  }

  emit('valueChange', newGroupValue, eventDetails)

  if (eventDetails.isCanceled) {
    return
  }

  setValueState(newGroupValue)
}

provide(toggleGroupContextKey, {
  disabled,
  orientation: computed(() => props.orientation),
  setGroupValue,
  value: groupValue,
  isValueInitialized,
})

const state = computed<ToggleGroupState>(() => ({
  disabled: disabled.value,
  multiple: props.multiple,
  orientation: props.orientation,
}))

const stateAttributesMapping: StateAttributesMapping<ToggleGroupState> = {
  multiple(value) {
    if (value) {
      return { [ToggleGroupDataAttributes.multiple]: '' }
    }

    return null
  },
}

const forwardedAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrsObject
  return rest
})

const rootProps = computed<HTMLProps>(() => ({
  'role': 'group',
  ...forwardedAttrs.value,
  'aria-orientation': props.orientation,
}))

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: rootProps,
  stateAttributesMapping,
  defaultTagName: 'div',
})
</script>

<template>
  <template v-if="toolbarContext">
    <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
    <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
      <slot :state="state" />
    </component>
  </template>
  <CompositeRoot
    v-else
    :as="as"
    :class="props.class"
    :style="props.style"
    :orientation="props.orientation"
    :state="state"
    :state-attributes-mapping="stateAttributesMapping"
    :loop-focus="props.loopFocus"
    :enable-home-and-end-keys="true"
    role="group"
    v-bind="forwardedAttrs"
  >
    <template v-if="renderless" #default="{ ref, props: compositeProps, state: compositeState }">
      <slot :ref="ref" :props="compositeProps" :state="compositeState" />
    </template>
    <template v-else #default="{ state: compositeState }">
      <slot :state="compositeState" />
    </template>
  </CompositeRoot>
</template>
