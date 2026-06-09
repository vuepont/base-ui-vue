<script setup lang="ts" generic="Value = any">
import type { Ref } from 'vue'
import type { FieldRootState } from '../field/root/FieldRoot.vue'
import type { BaseUIChangeEventDetails } from '../utils/createBaseUIEventDetails'
import type { REASONS } from '../utils/reasons'
import type { BaseUIComponentProps } from '../utils/types'
import { computed, provide, ref, useAttrs, watch } from 'vue'
import { SHIFT } from '../composite/composite'
import CompositeRoot from '../composite/root/CompositeRoot.vue'
import { useFieldRootContext } from '../field/root/FieldRootContext'
import { useField } from '../field/useField'
import { fieldValidityMapping } from '../field/utils/constants'
import { useFieldsetRootContext } from '../fieldset/root/FieldsetRootContext'
import { useFormContext } from '../form/FormContext'
import { useLabelableContext } from '../labelable-provider/LabelableContext'
import { mergeProps } from '../merge-props/mergeProps'
import { radioGroupContextKey } from '../radio/RadioGroupContext'
import { Slot } from '../utils/slot'
import { useBaseUiId } from '../utils/useBaseUiId'
import { useControllableState } from '../utils/useControllableState'
import { useMergedRefs } from '../utils/useMergedRefs'

export interface RadioGroupState extends FieldRootState {
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean
  /**
   * Whether the user should be unable to select a different radio button.
   */
  readOnly: boolean
  /**
   * Whether the user must choose a radio button before submitting a form.
   */
  required: boolean
}

export interface RadioGroupProps<Value = any> extends BaseUIComponentProps<RadioGroupState> {
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean
  /**
   * Whether the user should be unable to select a different radio button.
   * @default false
   */
  readOnly?: boolean
  /**
   * Whether the user must choose a value before submitting a form.
   * @default false
   */
  required?: boolean
  /**
   * Identifies the field when a form is submitted.
   */
  name?: string
  /**
   * Identifies the form that owns the radio inputs.
   * Useful when the radio group is rendered outside the form.
   */
  form?: string
  /**
   * The controlled value of the radio item that should be selected.
   *
   * To render an uncontrolled radio group, use the `defaultValue` prop instead.
   */
  value?: Value
  /**
   * The uncontrolled value of the radio button that should be initially selected.
   *
   * To render a controlled radio group, use the `value` prop instead.
   */
  defaultValue?: Value
  /**
   * A ref to access the currently selected hidden input element.
   */
  inputRef?: Ref<HTMLInputElement | null> | ((element: HTMLInputElement | null) => void) | null
  /**
   * The id of the radio group element.
   */
  id?: string
}

export type RadioGroupChangeEventReason = typeof REASONS.none
export type RadioGroupChangeEventDetails = BaseUIChangeEventDetails<RadioGroupChangeEventReason>

/**
 * Provides shared state to a series of radio buttons.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Radio](https://baseui-vue.com/docs/components/radio)
 */
defineOptions({
  name: 'RadioGroup',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<RadioGroupProps<Value>>(), {
  as: 'div',
  disabled: false,
  readOnly: false,
  required: false,
})

const emit = defineEmits<{
  /**
   * Event handler called when the group value changes.
   */
  valueChange: [
    value: Value,
    eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
  ]
}>()

const MODIFIER_KEYS = [SHIFT]

const attrs = useAttrs()
const attrsObject = attrs as Record<string, any>

const {
  disabled: fieldDisabled,
  name: fieldName,
  state: fieldState,
  validation,
  setDirty,
  setFilled,
  setFocused,
  setTouched: setFieldTouched,
  validationMode,
  shouldValidateOnChange,
  validityData,
} = useFieldRootContext()
const fieldsetContext = useFieldsetRootContext(true)
const labelableContext = useLabelableContext()
const { clearErrors } = useFormContext()

const disabled = computed(() =>
  fieldDisabled.value
  || Boolean(fieldsetContext?.disabled.value)
  || props.disabled,
)
const name = computed(() => fieldName.value ?? props.name)
const groupId = useBaseUiId(props.id)
const id = computed(() => props.id ?? groupId)

const { value: checkedValue, setValue: setCheckedValueState } = useControllableState<any>({
  controlled: () => props.value as any,
  default: () => props.defaultValue as any,
  name: 'RadioGroup',
  state: 'value',
})

const touched = ref(false)
const controlRef = ref<HTMLElement | null>(null)
const groupInputRef = ref<HTMLInputElement | null>(null)
const firstEnabledInputRef = ref<HTMLInputElement | null>(null)
const setInputRef = useMergedRefs(
  groupInputRef,
  props.inputRef,
  (element: HTMLInputElement | null) => {
    validation.setInputRef(element)
  },
)

function assignInputRef(element: HTMLInputElement | null) {
  setInputRef?.(element)
}

function setCheckedValue(
  value: Value,
  eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
) {
  emit('valueChange', value, eventDetails)

  if (eventDetails.isCanceled) {
    return
  }

  setCheckedValueState(value)
}

function registerControlRef(element: HTMLElement | null, isDisabled = false) {
  if (!element) {
    return
  }

  if (isDisabled) {
    if (controlRef.value === element) {
      controlRef.value = null
    }
    return
  }

  if (!controlRef.value) {
    controlRef.value = element
  }
}

function registerInputRef(input: HTMLInputElement | null) {
  if (!input || input.disabled) {
    return
  }

  if (!firstEnabledInputRef.value) {
    firstEnabledInputRef.value = input
  }

  const currentInput = groupInputRef.value
  if (input.checked || currentInput == null || currentInput.disabled) {
    assignInputRef(input)
  }
}

function getFormValue() {
  const input = groupInputRef.value
  if (!input || input.disabled || !input.checked) {
    return null
  }

  return checkedValue.value ?? null
}

useField({
  enabled: computed(() => Boolean(name.value)),
  id,
  commit: (value: unknown) => validation.commit(value),
  value: checkedValue as Ref<unknown>,
  controlRef,
  name,
  getValue: getFormValue,
})

watch(
  () => checkedValue.value,
  (nextValue) => {
    clearErrors(name.value)
    setDirty(nextValue !== validityData.value.initialValue)
    setFilled(nextValue != null)

    if (shouldValidateOnChange()) {
      void validation.commit(nextValue)
    }
    else {
      void validation.commit(nextValue, true)
    }

    const fallbackInput = firstEnabledInputRef.value
    if (nextValue == null && fallbackInput && !fallbackInput.disabled) {
      assignInputRef(fallbackInput)
    }
  },
  { flush: 'sync' },
)

function handleFocusIn() {
  setFocused(true)
}

function handleFocusOut(event: FocusEvent) {
  const currentTarget = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget as Node | null
  if (relatedTarget && currentTarget.contains(relatedTarget)) {
    return
  }

  setFieldTouched(true)
  setFocused(false)

  if (validationMode.value === 'onBlur') {
    void validation.commit(checkedValue.value)
  }
}

function handleKeydownCapture(event: KeyboardEvent) {
  if (event.key.startsWith('Arrow')) {
    setFieldTouched(true)
    touched.value = true
    setFocused(true)
  }
}

const state = computed<RadioGroupState>(() => ({
  ...fieldState.value,
  disabled: disabled.value,
  readOnly: props.readOnly,
  required: props.required,
}))

provide(radioGroupContextKey, {
  disabled,
  readOnly: computed(() => props.readOnly),
  required: computed(() => props.required),
  form: computed(() => props.form),
  name,
  checkedValue,
  touched,
  validation,
  setCheckedValue,
  setTouched(value) {
    touched.value = value
  },
  registerControlRef,
  registerInputRef,
})

const forwardedAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrsObject
  return rest
})

const rootProps = computed(() => mergeProps(
  forwardedAttrs.value,
  labelableContext.getDescriptionProps(),
  validation.getValidationProps(),
  {
    'id': id.value,
    'role': 'radiogroup',
    'aria-required': props.required || undefined,
    'aria-disabled': disabled.value || undefined,
    'aria-readonly': props.readOnly || undefined,
    'aria-labelledby': attrsObject['aria-labelledby'] ?? labelableContext.labelId.value ?? fieldsetContext?.legendId.value,
    'onFocusin': handleFocusIn,
    'onFocusout': handleFocusOut,
    'onKeydownCapture': handleKeydownCapture,
  },
))
</script>

<template>
  <CompositeRoot
    :as="as"
    :class="props.class"
    :style="props.style"
    :state="state"
    :state-attributes-mapping="fieldValidityMapping"
    :enable-home-and-end-keys="false"
    :modifier-keys="MODIFIER_KEYS"
    role="radiogroup"
    v-bind="rootProps"
  >
    <template v-if="as === Slot" #default="{ ref: rootRef, props: compositeProps, state: compositeState }">
      <slot :ref="rootRef" :props="compositeProps" :state="compositeState" />
    </template>
    <template v-else #default="{ state: compositeState }">
      <slot :state="compositeState" />
    </template>
  </CompositeRoot>
</template>
