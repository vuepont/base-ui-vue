<script setup lang="ts">
import type { FieldRootState } from '../field/root/FieldRoot.vue'
import type { BaseUIChangeEventDetails } from '../utils/createBaseUIEventDetails'
import type { REASONS } from '../utils/reasons'
import type { BaseUIComponentProps } from '../utils/types'
import { computed, provide, ref, useAttrs, watch, watchEffect } from 'vue'
import { useFieldRootContext } from '../field/root/FieldRootContext'
import { useField } from '../field/useField'
import { fieldValidityMapping } from '../field/utils/constants'
import { useFormContext } from '../form/FormContext'
import { useLabelableContext } from '../labelable-provider/LabelableContext'
import { mergeProps } from '../merge-props/mergeProps'
import { EMPTY_ARRAY } from '../utils/constants'
import { useBaseUiId } from '../utils/useBaseUiId'
import { useControllableState } from '../utils/useControllableState'
import { useRenderElement } from '../utils/useRenderElement'
import { checkboxGroupContextKey } from './CheckboxGroupContext'
import { useCheckboxGroupParent } from './useCheckboxGroupParent'

export interface CheckboxGroupState extends FieldRootState {
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean
}

export interface CheckboxGroupProps extends BaseUIComponentProps<CheckboxGroupState> {
  /**
   * Names of the checkboxes in the group that should be ticked.
   *
   * To render an uncontrolled checkbox group, use the `defaultValue` prop instead.
   */
  value?: string[]
  /**
   * Names of the checkboxes in the group that should be initially ticked.
   *
   * To render a controlled checkbox group, use the `value` prop instead.
   */
  defaultValue?: string[]
  /**
   * Names of all checkboxes in the group. Use this when creating a parent checkbox.
   */
  allValues?: string[]
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean
  id?: string
}

/**
 * Provides a shared state to a series of checkboxes.
 *
 * Documentation: [Base UI Vue Checkbox Group](https://baseui-vue.com/docs/components/checkbox-group)
 */
defineOptions({
  name: 'CheckboxGroup',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CheckboxGroupProps>(), {
  as: 'div',
  disabled: false,
  defaultValue: () => [],
})

const emit = defineEmits<{
  /**
   * Event handler called when a checkbox in the group is ticked or unticked.
   * Provides the new value as an argument.
   */
  valueChange: [
    value: string[],
    eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
  ]
}>()

const attrs = useAttrs()
const attrsObject = attrs as Record<string, any>

const {
  disabled: fieldDisabled,
  name: fieldName,
  state: fieldState,
  validation,
  setFilled,
  setDirty,
  shouldValidateOnChange,
  validityData,
} = useFieldRootContext()
const labelableContext = useLabelableContext()
const { labelId, getDescriptionProps } = labelableContext
const { clearErrors } = useFormContext()
const controlSource = Symbol('checkbox-group-control')

const disabled = computed(() => fieldDisabled.value || props.disabled)

const { value, setValue: setValueUnwrapped } = useControllableState<string[]>({
  controlled: () => props.value,
  default: props.defaultValue,
})

const generatedId = useBaseUiId()
const defaultValue = computed(() => props.defaultValue ?? [])
const allValues = computed(() => props.allValues)
const id = computed(() => props.id ?? generatedId)

watchEffect((onCleanup) => {
  labelableContext.registerControlId(controlSource, id.value)

  onCleanup(() => {
    labelableContext.registerControlId(controlSource, undefined)
  })
})

function setValue(
  nextValue: string[],
  eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
) {
  emit('valueChange', nextValue, eventDetails)

  if (eventDetails.isCanceled) {
    return
  }

  setValueUnwrapped(nextValue)
}

const parent = useCheckboxGroupParent({
  allValues,
  value,
  onValueChange: setValue,
})

const controlRef = ref<HTMLElement | null>(null)

function registerControlRef(element: HTMLElement | null) {
  if (controlRef.value == null && element != null && !element.hasAttribute('data-parent')) {
    controlRef.value = element
  }
}

useField({
  enabled: computed(() => Boolean(fieldName.value)),
  id,
  commit: validation.commit,
  value,
  controlRef,
  name: fieldName,
  getValue: () => value.value,
})

watch(
  () => value.value.slice(),
  (nextValue) => {
    if (fieldName.value) {
      clearErrors(fieldName.value)
    }

    const initialValue = Array.isArray(validityData.value.initialValue)
      ? validityData.value.initialValue as string[]
      : EMPTY_ARRAY as string[]
    const normalizedNextValue = normalizeSelection(nextValue)
    const normalizedInitialValue = normalizeSelection(initialValue)

    setFilled(nextValue.length > 0)
    setDirty(!areArraysEqual(normalizedNextValue, normalizedInitialValue))

    if (shouldValidateOnChange()) {
      void validation.commit(nextValue)
    }
    else {
      void validation.commit(nextValue, true)
    }
  },
  { flush: 'sync' },
)

const state = computed<CheckboxGroupState>(() => ({
  ...fieldState.value,
  disabled: disabled.value,
}))

provide(checkboxGroupContextKey, {
  value,
  defaultValue,
  allValues,
  disabled,
  validation,
  parent,
  setValue,
  registerControlRef,
})

const rootProps = computed(() => mergeProps(
  attrsObject,
  getDescriptionProps(),
  {
    'role': 'group',
    'aria-labelledby': labelId.value,
  },
))

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: rootProps,
  stateAttributesMapping: fieldValidityMapping,
  defaultTagName: 'div',
})

function areArraysEqual(a: readonly string[], b: readonly string[]) {
  if (a === b) {
    return true
  }

  if (a.length !== b.length) {
    return false
  }

  return a.every((item, index) => item === b[index])
}

function normalizeSelection(values: readonly string[]) {
  return values.slice().sort()
}
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
