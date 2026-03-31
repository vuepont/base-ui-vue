<script setup lang="ts">
import type { Ref } from 'vue'
import type { FieldRootState } from '../../field/root/FieldRoot.vue'
import type { BaseUIChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import type { BaseUIComponentProps, NonNativeButtonProps } from '../../utils/types'
import { computed, getCurrentInstance, provide, ref, useAttrs, watch, watchEffect } from 'vue'
import { useFieldRootContext } from '../../field/root/FieldRootContext'
import { useField } from '../../field/useField'
import { useFormContext } from '../../form/FormContext'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { useAriaLabelledBy } from '../../labelable-provider/useAriaLabelledBy'
import { useLabelableId } from '../../labelable-provider/useLabelableId'
import { mergeProps } from '../../merge-props/mergeProps'
import { useButton } from '../../use-button'
import { createChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import { EMPTY_OBJECT } from '../../utils/empty'
import { REASONS } from '../../utils/reasons'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useControllableState } from '../../utils/useControllableState'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { useRenderElement } from '../../utils/useRenderElement'
import { visuallyHidden, visuallyHiddenInput } from '../../utils/visuallyHidden'
import { stateAttributesMapping } from '../stateAttributesMapping'
import { switchRootContextKey } from './SwitchRootContext'

export interface SwitchRootState extends FieldRootState {
  /**
   * Whether the switch is currently active.
   */
  checked: boolean
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean
  /**
   * Whether the user should be unable to activate or deactivate the switch.
   */
  readOnly: boolean
  /**
   * Whether the user must activate the switch before submitting a form.
   */
  required: boolean
}

export interface SwitchRootProps
  extends NonNativeButtonProps, BaseUIComponentProps<SwitchRootState> {
  /**
   * The id of the switch element.
   */
  'id'?: string
  /**
   * Whether the switch is currently active.
   *
   * To render an uncontrolled switch, use the `defaultChecked` prop instead.
   */
  'checked'?: boolean
  /**
   * Whether the switch is initially active.
   *
   * To render a controlled switch, use the `checked` prop instead.
   * @default false
   */
  'defaultChecked'?: boolean
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  'disabled'?: boolean
  /**
   * A ref to access the hidden `<input>` element.
   */
  'inputRef'?: Ref<HTMLInputElement | null> | ((element: HTMLInputElement | null) => void) | null
  /**
   * Identifies the field when a form is submitted.
   */
  'name'?: string
  /**
   * Identifies the form that owns the hidden input.
   * Useful when the switch is rendered outside the form.
   */
  'form'?: string
  /**
   * Whether the user should be unable to activate or deactivate the switch.
   * @default false
   */
  'readOnly'?: boolean
  /**
   * Whether the user must activate the switch before submitting a form.
   * @default false
   */
  'required'?: boolean
  /**
   * The value submitted with the form when the switch is on.
   * By default, switch submits the "on" value, matching native checkbox behavior.
   */
  'value'?: string
  /**
   * The value submitted with the form when the switch is off.
   * By default, unchecked switches do not submit any value, matching native checkbox behavior.
   */
  'uncheckedValue'?: string
  /**
   * Identifies the element that labels the switch.
   * When omitted, Base UI Vue falls back to the surrounding label system.
   */
  // eslint-disable-next-line vue/prop-name-casing
  'aria-labelledby'?: string
}

export type SwitchRootChangeEventReason = typeof REASONS.none
export type SwitchRootChangeEventDetails = BaseUIChangeEventDetails<SwitchRootChangeEventReason>

/**
 * Represents the switch itself.
 * Renders a `<span>` element and a hidden `<input>` beside.
 *
 * Documentation: [Base UI Vue Switch](https://baseui-vue.com/docs/components/switch)
 */
defineOptions({
  name: 'SwitchRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SwitchRootProps>(), {
  as: 'span',
  defaultChecked: false,
  disabled: false,
  nativeButton: false,
  readOnly: false,
  required: false,
})

const emit = defineEmits<{
  /**
   * Event handler called when the switch is activated or deactivated.
   */
  checkedChange: [
    checked: boolean,
    eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
  ]
}>()

const attrs = useAttrs()
const attrsObject = attrs as Record<string, unknown>
const instance = getCurrentInstance()

const { clearErrors } = useFormContext()
const {
  disabled: fieldDisabled,
  name: fieldName,
  setDirty,
  setFilled,
  setFocused,
  setTouched,
  state: fieldState,
  validationMode,
  validityData,
  shouldValidateOnChange,
  validation,
} = useFieldRootContext()
const labelableContext = useLabelableContext()

const disabled = computed(() => fieldDisabled.value || props.disabled)
const name = computed(() => fieldName.value ?? props.name)

const rootElementId = useBaseUiId()
const controlId = useLabelableId({ id: () => props.id })
const inputId = computed(() => (props.nativeButton ? undefined : controlId.value))

const { value: checked, setValue: setCheckedState } = useControllableState<boolean>({
  controlled: () => (
    instance?.vnode.props && Object.prototype.hasOwnProperty.call(instance.vnode.props, 'checked')
      ? props.checked
      : undefined
  ),
  default: () => props.defaultChecked,
  name: 'Switch',
  state: 'checked',
})

const controlRef = ref<HTMLElement | null>(null)
const inputElementRef = ref<HTMLInputElement | null>(null)
const mergedInputRef = useMergedRefs(inputElementRef, props.inputRef)

useField({
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
  labelSourceRef: inputElementRef,
  enableFallback: !props.nativeButton,
  labelSourceId: inputId,
})

watchEffect(() => {
  if (checked.value) {
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
    'aria-describedby': describedBy,
  }
}

function applyCheckedChange(
  nextChecked: boolean,
  event: Event,
  onApplied?: () => void,
) {
  const details = createChangeEventDetails(REASONS.none, event)

  emit('checkedChange', nextChecked, details)

  if (details.isCanceled) {
    return false
  }

  onApplied?.()
  setCheckedState(nextChecked)
  return true
}

function handleInputChange(event: Event) {
  const target = event.currentTarget as HTMLInputElement

  if (props.readOnly || disabled.value) {
    event.preventDefault()
    event.stopPropagation()
    target.checked = checked.value
    return
  }

  const applied = applyCheckedChange(target.checked, event)
  if (!applied) {
    target.checked = checked.value
  }
}

function handleRootClick(event: MouseEvent | KeyboardEvent) {
  if (props.readOnly || disabled.value) {
    return
  }

  event.preventDefault()

  const nextChecked = !checked.value
  applyCheckedChange(nextChecked, event, () => {
    if (inputElementRef.value) {
      inputElementRef.value.checked = nextChecked
    }
  })
}

function handleFocus() {
  if (!disabled.value) {
    setFocused(true)
  }
}

function handleBlur() {
  if (disabled.value) {
    return
  }

  setTouched(true)
  setFocused(false)

  if (validationMode.value === 'onBlur') {
    void validation.commit(checked.value)
  }
}

const state = computed<SwitchRootState>(() => ({
  ...fieldState.value,
  checked: checked.value,
  disabled: disabled.value,
  readOnly: props.readOnly,
  required: props.required,
}))

provide(switchRootContextKey, state)
defineExpose({
  element: controlRef,
})

const mergedRootRef = useMergedRefs(buttonRef, controlRef)

const buttonInteractionAttrs = computed(() => ({
  onClick: attrsObject.onClick,
  onKeydown: attrsObject.onKeydown,
  onKeyup: attrsObject.onKeyup,
  onMousedown: attrsObject.onMousedown,
  onPointerdown: attrsObject.onPointerdown,
}))

const passthroughAttrs = computed(() => {
  const {
    onClick,
    onKeydown,
    onKeyup,
    onMousedown,
    onPointerdown,
    ...rest
  } = attrsObject

  return rest
})

const rootProps = computed(() => {
  const localDescriptionProps = labelableContext.getDescriptionProps()
  const validationProps = validation.getValidationProps()
  const buttonProps = getButtonProps(
    mergeProps(buttonInteractionAttrs.value, {
      onClick: handleRootClick,
    }),
  )

  return mergeProps(
    buttonProps,
    combineDescriptionProps(localDescriptionProps, validationProps),
    {
      'id': props.nativeButton ? controlId.value : rootElementId,
      'role': 'switch',
      'aria-checked': checked.value,
      'aria-readonly': props.readOnly || undefined,
      'aria-required': props.required || undefined,
      'aria-labelledby': ariaLabelledBy.value,
      'onFocus': handleFocus,
      'onBlur': handleBlur,
    },
    passthroughAttrs.value,
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
  const validationProps = validation.getInputValidationProps()

  return mergeProps(
    {
      'checked': checked.value,
      'disabled': disabled.value,
      'form': props.form,
      'id': props.nativeButton ? undefined : inputId.value,
      'name': name.value,
      'required': props.required,
      'type': 'checkbox',
      'aria-hidden': true,
      'tabindex': -1,
      'style': name.value ? visuallyHiddenInput : visuallyHidden,
      'onChange': handleInputChange,
      onFocus() {
        controlRef.value?.focus()
      },
    },
    props.value !== undefined
      ? { value: props.value }
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
    v-if="!checked && !disabled && name && uncheckedValue !== undefined"
    type="hidden"
    :form="form"
    :name="name"
    :value="uncheckedValue"
  >
  <input :ref="mergedInputRef" v-bind="inputProps">
</template>
