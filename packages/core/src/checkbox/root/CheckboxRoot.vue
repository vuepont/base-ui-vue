<script setup lang="ts">
import type { FieldRootState } from '../../field/root/FieldRoot.vue'
import type { BaseUIChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import type { BaseUIComponentProps, NonNativeButtonProps } from '../../utils/types'
import { computed, getCurrentInstance, provide, ref, useAttrs, watch, watchEffect } from 'vue'
import { useCheckboxGroupContext } from '../../checkbox-group/CheckboxGroupContext'
import { useFieldItemContext } from '../../field/item/FieldItemContext'
import { useFieldRootContext } from '../../field/root/FieldRootContext'
import { useField } from '../../field/useField'
import { useFormContext } from '../../form/FormContext'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { useAriaLabelledBy } from '../../labelable-provider/useAriaLabelledBy'
import { mergeProps } from '../../merge-props/mergeProps'
import { useButton } from '../../use-button'
import { createChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import { EMPTY_OBJECT } from '../../utils/empty'
import { REASONS } from '../../utils/reasons'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useControllableState } from '../../utils/useControllableState'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { useRenderElement } from '../../utils/useRenderElement'
import { useCheckboxStateAttributesMapping } from '../utils/useStateAttributesMapping'
import { checkboxRootContextKey } from './CheckboxRootContext'

interface GroupCheckboxProps {
  'id'?: string
  'checked'?: boolean
  'indeterminate'?: boolean
  'aria-controls'?: string
  'onCheckedChange'?: (
    checked: boolean,
    eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
  ) => void
}

export interface CheckboxRootState extends FieldRootState {
  /**
   * Whether the checkbox is currently ticked.
   */
  checked: boolean
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean
  /**
   * Whether the user should be unable to tick or untick the checkbox.
   */
  readOnly: boolean
  /**
   * Whether the user must tick the checkbox before submitting a form.
   */
  required: boolean
  /**
   * Whether the checkbox is in a mixed state: neither ticked, nor unticked.
   */
  indeterminate: boolean
}

export interface CheckboxRootProps
  extends
  NonNativeButtonProps,
  BaseUIComponentProps<CheckboxRootState> {
  /**
   * The id of the input element.
   */
  'id'?: string
  /**
   * Identifies the field when a form is submitted.
   * @default undefined
   */
  'name'?: string
  /**
   * Identifies the form that owns the hidden input.
   * Useful when the checkbox is rendered outside the form.
   */
  'form'?: string
  /**
   * Whether the checkbox is currently ticked.
   *
   * To render an uncontrolled checkbox, use the `defaultChecked` prop instead.
   * @default undefined
   */
  'checked'?: boolean
  /**
   * Whether the checkbox is initially ticked.
   *
   * To render a controlled checkbox, use the `checked` prop instead.
   * @default false
   */
  'defaultChecked'?: boolean
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  'disabled'?: boolean
  /**
   * Whether the user should be unable to tick or untick the checkbox.
   * @default false
   */
  'readOnly'?: boolean
  /**
   * Whether the user must tick the checkbox before submitting a form.
   * @default false
   */
  'required'?: boolean
  /**
   * Whether the checkbox is in a mixed state: neither ticked, nor unticked.
   * @default false
   */
  'indeterminate'?: boolean
  /**
   * A ref to access the hidden `<input>` element.
   */
  'inputRef'?: any
  /**
   * Whether the checkbox controls a group of child checkboxes.
   *
   * Must be used in a [Checkbox Group](https://baseui-vue.com/docs/components/checkbox-group).
   * @default false
   */
  'parent'?: boolean
  /**
   * The value submitted with the form when the checkbox is unchecked.
   * By default, unchecked checkboxes do not submit any value, matching native checkbox behavior.
   */
  'uncheckedValue'?: string
  /**
   * The value of the selected checkbox.
   */
  'value'?: string
  // eslint-disable-next-line vue/prop-name-casing
  'aria-labelledby'?: string
}

/**
 * Represents the checkbox itself.
 * Renders a `<span>` element and a hidden `<input>` beside.
 *
 * Documentation: [Base UI Vue Checkbox](https://baseui-vue.com/docs/components/checkbox)
 */
defineOptions({
  name: 'CheckboxRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CheckboxRootProps>(), {
  as: 'span',
  defaultChecked: false,
  disabled: false,
  readOnly: false,
  required: false,
  indeterminate: false,
  parent: false,
  nativeButton: false,
})

const emit = defineEmits<{
  /**
   * Event handler called when the checkbox is ticked or unticked.
   */
  checkedChange: [
    checked: boolean,
    eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
  ]
}>()

const attrs = useAttrs()
const attrsObject = attrs as Record<string, any>
const instance = getCurrentInstance()
const controlSource = Symbol('checkbox-control')

const { clearErrors } = useFormContext()
const {
  disabled: rootDisabled,
  name: fieldName,
  setDirty,
  setFilled,
  setFocused,
  setTouched,
  state: fieldState,
  validationMode,
  validityData,
  shouldValidateOnChange,
  validation: localValidation,
} = useFieldRootContext()
const fieldItemContext = useFieldItemContext()
const labelableContext = useLabelableContext()
const groupContext = useCheckboxGroupContext(true)

const parentContext = computed(() => groupContext?.parent)
const isGroupedWithParent = computed(() =>
  Boolean(parentContext.value && groupContext && groupContext.allValues.value !== undefined),
)

const disabled = computed(() =>
  rootDisabled.value
  || fieldItemContext.disabled.value
  || groupContext?.disabled.value
  || props.disabled,
)
const name = computed(() => fieldName.value ?? props.name)
const checkboxValue = computed(() => props.value ?? name.value)

const rootElementId = useBaseUiId()
const generatedInputId = useBaseUiId()
const groupParentId = useBaseUiId()

const inputId = computed(() => {
  // Parent/child checkboxes inside a group share a predictable id scheme so the
  // parent can point `aria-controls` at child inputs
  if (isGroupedWithParent.value && parentContext.value) {
    if (props.parent) {
      return parentContext.value.id ?? groupParentId
    }

    if (checkboxValue.value) {
      return `${parentContext.value.id}-${checkboxValue.value}`
    }
  }

  if (props.id) {
    return props.id
  }

  return labelableContext.controlId.value ?? generatedInputId
})

watchEffect((onCleanup) => {
  // Register the focusable/native control id with the surrounding label system.
  labelableContext.registerControlId(controlSource, inputId.value)

  onCleanup(() => {
    labelableContext.registerControlId(controlSource, undefined)
  })
})

const groupProps = computed<GroupCheckboxProps>(() => {
  if (!isGroupedWithParent.value || !groupContext) {
    return {}
  }

  if (props.parent) {
    return groupContext.parent.getParentProps()
  }

  if (checkboxValue.value) {
    return groupContext.parent.getChildProps(checkboxValue.value)
  }

  return {}
})

const hasCheckedProp = computed(() =>
  Boolean(instance?.vnode.props && Object.prototype.hasOwnProperty.call(instance.vnode.props, 'checked')),
)

const groupChecked = computed(() => {
  const checked = groupProps.value.checked
  return checked === undefined
    ? (hasCheckedProp.value ? props.checked : undefined)
    : checked
})

const groupIndeterminate = computed(() => {
  const indeterminate = groupProps.value.indeterminate
  return indeterminate === undefined ? props.indeterminate : indeterminate
})

const validation = groupContext?.validation ?? localValidation

const { value: checked, setValue: setCheckedState } = useControllableState<boolean>({
  controlled: () => {
    // Child checkboxes in a group derive checked state from the shared value array.
    if (groupContext && !props.parent && checkboxValue.value) {
      return groupContext.value.value.includes(checkboxValue.value)
    }

    return groupChecked.value
  },
  default:
    groupContext && !props.parent && checkboxValue.value
      ? groupContext.defaultValue.value.includes(checkboxValue.value)
      : props.defaultChecked,
})

const computedChecked = computed(() =>
  isGroupedWithParent.value ? Boolean(groupChecked.value) : checked.value,
)
const computedIndeterminate = computed(() =>
  isGroupedWithParent.value
    ? Boolean(groupIndeterminate.value || props.indeterminate)
    : props.indeterminate,
)

const controlRef = ref<HTMLElement | null>(null)
const inputElementRef = ref<HTMLInputElement | null>(null)

useField({
  // Standalone checkboxes participate in Field/Form registration directly.
  // Grouped checkboxes defer validation state to the group container instead.
  enabled: computed(() => !groupContext),
  id: computed(() => rootElementId),
  commit: validation.commit,
  value: checked,
  controlRef,
  name,
  getValue: () => checked.value,
})

const ariaLabelledBy = useAriaLabelledBy({
  ariaLabelledBy: computed(() => props['aria-labelledby']),
  labelId: labelableContext.labelId,
  // Use the hidden input for native-label fallback detection because it is the
  // element associated with sibling/wrapping `<label>` elements.
  labelSourceRef: inputElementRef,
  enableFallback: !props.nativeButton,
  labelSourceId: inputId,
})

watchEffect(() => {
  if (inputElementRef.value) {
    inputElementRef.value.indeterminate = computedIndeterminate.value
  }
})

watchEffect(() => {
  // Preserve filled field state for initially checked checkboxes without
  // resetting a shared group field back to unfilled.
  if (computedChecked.value) {
    setFilled(true)
  }
})

watchEffect(() => {
  if (!inputElementRef.value) {
    return
  }

  validation.setInputRef(inputElementRef.value)
})

watch(
  () => checked.value,
  (nextChecked) => {
    if (groupContext && !props.parent) {
      return
    }

    clearErrors(name.value)
    setFilled(nextChecked)
    setDirty(nextChecked !== validityData.value.initialValue)

    if (shouldValidateOnChange()) {
      void validation.commit(nextChecked)
    }
    else {
      void validation.commit(nextChecked, true)
    }
  },
  { flush: 'sync' },
)

watchEffect((onCleanup) => {
  if (!parentContext.value || !checkboxValue.value) {
    return
  }

  parentContext.value.disabledStatesRef.value.set(checkboxValue.value, disabled.value)

  onCleanup(() => {
    parentContext.value?.disabledStatesRef.value.delete(checkboxValue.value!)
  })
})

const { getButtonProps, buttonRef } = useButton({
  disabled,
  native: computed(() => props.nativeButton),
})

function combineDescriptionProps(
  localProps: Record<string, any>,
  validationProps: Record<string, any>,
) {
  const localDescribedBy = localProps['aria-describedby']
  const validationDescribedBy = validationProps['aria-describedby']
  const describedBy = Array.from(
    new Set(
      [localDescribedBy, validationDescribedBy]
        .filter(Boolean)
        .flatMap(value => String(value).split(/\s+/).filter(Boolean)),
    ),
  ).join(' ') || undefined

  return {
    ...localProps,
    ...validationProps,
    // Avoid duplicating ids when both field descriptions and validation props
    // contribute the same `aria-describedby` tokens.
    'aria-describedby': describedBy,
  }
}

function applyCheckedChange(nextChecked: boolean, event: Event) {
  const details = createChangeEventDetails(REASONS.none, event)

  groupProps.value.onCheckedChange?.(nextChecked, details)
  emit('checkedChange', nextChecked, details)

  if (details.isCanceled) {
    return
  }

  setCheckedState(nextChecked)

  // Standalone children of a CheckboxGroup update the shared value array here;
  // parent checkboxes use the group's parent-controller helpers instead.
  if (groupContext && !isGroupedWithParent.value && !props.parent && checkboxValue.value) {
    const currentValue = groupContext.value.value.slice()
    const nextValue = nextChecked
      ? Array.from(new Set([...currentValue, checkboxValue.value]))
      : currentValue.filter((item: string) => item !== checkboxValue.value)

    groupContext.setValue(nextValue, details)
  }
}

function handleInputChange(event: Event) {
  const target = event.currentTarget as HTMLInputElement
  applyCheckedChange(target.checked, event)
}

function handleRootClick(event: MouseEvent | KeyboardEvent) {
  if (props.readOnly || disabled.value || (!props.parent && props.indeterminate)) {
    return
  }

  event.preventDefault()

  const nextChecked = !computedChecked.value

  if (inputElementRef.value) {
    // Keep the hidden native input in sync so form submission mirrors button state.
    inputElementRef.value.checked = nextChecked
  }

  applyCheckedChange(nextChecked, event)
}

function handleFocus() {
  setFocused(true)
}

function handleBlur() {
  setTouched(true)
  setFocused(false)

  if (validationMode.value === 'onBlur') {
    void validation.commit(groupContext ? groupContext.value.value : checked.value)
  }
}

const state = computed<CheckboxRootState>(() => ({
  ...fieldState.value,
  checked: computedChecked.value,
  disabled: disabled.value,
  readOnly: props.readOnly,
  required: props.required,
  indeterminate: computedIndeterminate.value,
}))

provide(checkboxRootContextKey, state)

const stateAttributesMapping = useCheckboxStateAttributesMapping(state)

const mergedRootRef = useMergedRefs(
  buttonRef,
  controlRef,
  groupContext?.registerControlRef,
)

const rootProps = computed(() => {
  const localDescriptionProps = labelableContext.getDescriptionProps()
  const validationProps = validation.getValidationProps()
  const buttonProps = getButtonProps({
    onClick: handleRootClick,
  })

  return mergeProps(
    buttonProps,
    combineDescriptionProps(localDescriptionProps, validationProps),
    groupProps.value['aria-controls'] ? { 'aria-controls': groupProps.value['aria-controls'] } : EMPTY_OBJECT,
    {
      'id': groupProps.value.id ?? (props.nativeButton ? inputId.value : rootElementId),
      'role': 'checkbox',
      'aria-checked': computedIndeterminate.value ? 'mixed' : computedChecked.value,
      'aria-readonly': props.readOnly || undefined,
      'aria-required': props.required || undefined,
      'aria-labelledby': ariaLabelledBy.value,
      'data-parent': props.parent ? '' : undefined,
      'onFocus': handleFocus,
      'onBlur': handleBlur,
    },
    attrsObject,
  )
})

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
  defaultTagName: 'span',
  ref: mergedRootRef,
})

const inputProps = computed(() => {
  const localDescriptionProps = labelableContext.getDescriptionProps()
  const validationProps = groupContext
    ? validation.getValidationProps()
    : validation.getInputValidationProps()

  return mergeProps(
    {
      'checked': computedChecked.value,
      'disabled': disabled.value,
      'form': props.form,
      'name': props.parent ? undefined : name.value,
      'id': props.nativeButton ? undefined : inputId.value,
      'required': props.required,
      'ref': useMergedRefs(inputElementRef, props.inputRef),
      'type': 'checkbox',
      'aria-hidden': true,
      'tabindex': -1,
      // This hidden input carries the native form semantics while the rendered
      // root element exposes the custom checkbox interaction model.
      // TODO: Add shared `visuallyHidden` and `visuallyHiddenInput` utilities
      'style': {
        position: 'absolute',
        opacity: 0,
        pointerEvents: 'none',
        width: '1px',
        height: '1px',
        margin: 0,
      },
      'onChange': handleInputChange,
      onFocus() {
        controlRef.value?.focus()
      },
    },
    checkboxValue.value !== undefined
      ? { value: groupContext ? (computedChecked.value ? checkboxValue.value : '') : checkboxValue.value }
      : EMPTY_OBJECT,
    combineDescriptionProps(localDescriptionProps, validationProps),
  )
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
  <input
    v-if="!computedChecked && !groupContext && name && !parent && uncheckedValue !== undefined"
    type="hidden"
    :form="form"
    :name="name"
    :value="uncheckedValue"
  >
  <input v-bind="inputProps">
</template>
