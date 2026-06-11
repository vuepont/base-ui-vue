<script setup lang="ts" generic="Value = unknown">
import type { Ref } from 'vue'
import type { FieldRootState } from '../../field/root/FieldRoot.vue'
import type { BaseUIChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import type { BaseUIComponentProps, NonNativeButtonProps } from '../../utils/types'
import { computed, provide, ref, useAttrs, watch, watchEffect } from 'vue'
import { ACTIVE_COMPOSITE_ITEM } from '../../composite/constants'
import CompositeItem from '../../composite/item/CompositeItem.vue'
import { useFieldItemContext } from '../../field/item/FieldItemContext'
import { useFieldRootContext } from '../../field/root/FieldRootContext'
import { useField } from '../../field/useField'
import { useFormContext } from '../../form/FormContext'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { useAriaLabelledBy } from '../../labelable-provider/useAriaLabelledBy'
import { useLabelableId } from '../../labelable-provider/useLabelableId'
import { mergeProps } from '../../merge-props/mergeProps'
import { useRadioGroupContext } from '../../radio-group/RadioGroupContext'
import { useButton } from '../../use-button'
import { createChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import { EMPTY_OBJECT } from '../../utils/empty'
import { ownerWindow } from '../../utils/owner'
import { REASONS } from '../../utils/reasons'
import { serializeValue } from '../../utils/serializeValue'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { useRenderElement } from '../../utils/useRenderElement'
import { visuallyHidden, visuallyHiddenInput } from '../../utils/visuallyHidden'
import { stateAttributesMapping } from '../utils/stateAttributesMapping'
import { radioRootContextKey } from './RadioRootContext'

export interface RadioRootState extends FieldRootState {
  /**
   * Whether the radio button is currently selected.
   */
  checked: boolean
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean
  /**
   * Whether the user should be unable to select the radio button.
   */
  readOnly: boolean
  /**
   * Whether the user must choose a value before submitting a form.
   */
  required: boolean
}

export type RadioRootChangeEventReason = typeof REASONS.none
export type RadioRootChangeEventDetails = BaseUIChangeEventDetails<RadioRootChangeEventReason>

export interface RadioRootProps<Value = unknown>
  extends NonNativeButtonProps, BaseUIComponentProps<RadioRootState> {
  /**
   * The id of the radio control.
   */
  'id'?: string
  /**
   * The unique identifying value of the radio in a group.
   */
  'value': Value
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  'disabled'?: boolean
  /**
   * Whether the user should be unable to select the radio button.
   * @default false
   */
  'readOnly'?: boolean
  /**
   * Whether the user must choose a value before submitting a form.
   * @default false
   */
  'required'?: boolean
  /**
   * A ref to access the hidden `<input>` element.
   */
  'inputRef'?: Ref<HTMLInputElement | null> | ((element: HTMLInputElement | null) => void) | null
  /**
   * Identifies the element that labels the radio.
   * When omitted, Base UI Vue falls back to the surrounding label system.
   */
  // eslint-disable-next-line vue/prop-name-casing
  'aria-labelledby'?: string
}

/**
 * Represents the radio button itself.
 * Renders a `<span>` element and a hidden `<input>` beside.
 *
 * Documentation: [Base UI Vue Radio](https://baseui-vue.com/docs/components/radio)
 */
defineOptions({
  name: 'RadioRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<RadioRootProps<Value>>(), {
  as: 'span',
  disabled: false,
  nativeButton: false,
  readOnly: false,
  required: false,
})

const attrs = useAttrs()
const attrsObject = attrs as Record<string, unknown>

const { clearErrors } = useFormContext()
const {
  disabled: fieldDisabled,
  name: fieldName,
  setDirty,
  setFilled,
  setFocused,
  setTouched: setFieldTouched,
  state: fieldState,
  validationMode,
  validityData,
  shouldValidateOnChange,
  validation: localValidation,
} = useFieldRootContext()
const fieldItemContext = useFieldItemContext()
const labelableContext = useLabelableContext()
const groupContext = useRadioGroupContext<Value>(true)

const disabled = computed(() =>
  fieldDisabled.value
  || fieldItemContext.disabled.value
  || Boolean(groupContext?.disabled.value)
  || props.disabled,
)
const readOnly = computed(() => Boolean(groupContext?.readOnly.value) || props.readOnly)
const required = computed(() => Boolean(groupContext?.required.value) || props.required)
const name = computed(() => groupContext?.name.value ?? fieldName.value)
const form = computed(() => groupContext?.form.value)
const validation = groupContext?.validation ?? localValidation

const checked = computed(() => {
  if (groupContext) {
    return groupContext.checkedValue.value === props.value
  }

  return props.value === ''
})

const rootElementId = useBaseUiId()
const controlId = useLabelableId({ id: () => props.id })
const inputId = computed(() => (props.nativeButton ? undefined : controlId.value))

const controlRef = ref<HTMLElement | null>(null)
const inputElementRef = ref<HTMLInputElement | null>(null)
const mergedInputRef = useMergedRefs(inputElementRef, props.inputRef)
let pendingInputClickEvent: Event | null = null

useField({
  enabled: computed(() => !groupContext),
  id: computed(() => rootElementId),
  commit: (value: unknown) => validation.commit(value),
  value: checked,
  controlRef,
  name,
  getValue: () => checked.value ? props.value : null,
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

watchEffect((onCleanup) => {
  const input = inputElementRef.value
  if (!input) {
    return
  }

  if (groupContext) {
    const isChecked = checked.value

    if (disabled.value && isChecked) {
      groupContext.registerInputRef(null)
      return
    }

    groupContext.registerInputRef(input, isChecked)

    onCleanup(() => {
      groupContext.registerInputRef(null)
    })
    return
  }

  validation.setInputRef(input)
})

watchEffect((onCleanup) => {
  const element = controlRef.value
  if (!element || !groupContext) {
    return
  }

  groupContext.registerControlRef(element, disabled.value)

  onCleanup(() => {
    groupContext.registerControlRef(null)
  })
})

watch(
  () => checked.value,
  (nextChecked) => {
    if (groupContext) {
      return
    }

    clearErrors(name.value)
    setFilled(nextChecked)
    setDirty((nextChecked ? props.value : null) !== validityData.value.initialValue)

    const nextValue = nextChecked ? props.value : null
    if (shouldValidateOnChange()) {
      void validation.commit(nextValue)
    }
    else {
      void validation.commit(nextValue, true)
    }
  },
)

const { getButtonProps, buttonRef } = useButton({
  disabled,
  native: computed(() => props.nativeButton),
})

function combineDescriptionProps<
  LocalProps extends object,
  ValidationProps extends object,
>(
  localProps: LocalProps,
  validationProps: ValidationProps,
  externalProps: { 'aria-describedby'?: unknown } = {},
): LocalProps & ValidationProps & { 'aria-describedby'?: string } {
  const describedBy = Array.from(
    new Set(
      [
        externalProps['aria-describedby'],
        (localProps as { 'aria-describedby'?: unknown })['aria-describedby'],
        (validationProps as { 'aria-describedby'?: unknown })['aria-describedby'],
      ]
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

function createInputClickEvent(event: MouseEvent | KeyboardEvent) {
  const input = inputElementRef.value
  if (!input) {
    return undefined
  }

  const win = ownerWindow(input)
  const PointerEventCtor = win.PointerEvent ?? win.MouseEvent

  return new PointerEventCtor('click', {
    bubbles: true,
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    altKey: event.altKey,
    metaKey: event.metaKey,
  })
}

function applyCheckedValue(event: Event) {
  if (disabled.value || readOnly.value || props.value === undefined) {
    return false
  }

  const details = createChangeEventDetails(REASONS.none, pendingInputClickEvent ?? event)

  if (details.isCanceled) {
    return false
  }

  if (groupContext) {
    groupContext.setCheckedValue(props.value, details)
    if (details.isCanceled) {
      return false
    }

    setFieldTouched(true)
    return !details.isCanceled
  }

  setFieldTouched(true)
  setDirty(props.value !== validityData.value.initialValue)
  setFilled(true)

  clearErrors(name.value)

  if (shouldValidateOnChange()) {
    void validation.commit(props.value)
  }
  else {
    void validation.commit(props.value, true)
  }

  return !details.isCanceled
}

function handleInputClick(event: MouseEvent) {
  pendingInputClickEvent = event

  queueMicrotask(() => {
    if (pendingInputClickEvent === event) {
      pendingInputClickEvent = null
    }
  })
}

function handleInputChange(event: Event) {
  if (event.defaultPrevented) {
    return
  }

  const target = event.currentTarget as HTMLInputElement
  const applied = applyCheckedValue(event)
  pendingInputClickEvent = null

  if (!applied) {
    target.checked = checked.value
  }
}

function handleRootClick(event: MouseEvent | KeyboardEvent) {
  if (event.defaultPrevented || disabled.value || readOnly.value) {
    return
  }

  event.preventDefault()

  const inputClickEvent = createInputClickEvent(event)
  if (!inputClickEvent) {
    return
  }

  inputElementRef.value?.dispatchEvent(inputClickEvent)
}

function handleRootKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    ;(event as KeyboardEvent & { preventBaseUIHandler?: () => void }).preventBaseUIHandler?.()
  }
}

function handleRootFocus(event: FocusEvent) {
  if (event.defaultPrevented || disabled.value || readOnly.value) {
    return
  }

  if (groupContext?.touched.value) {
    inputElementRef.value?.click()
    groupContext.setTouched(false)
    return
  }

  if (!groupContext) {
    setFocused(true)
  }
}

function handleRootBlur() {
  if (disabled.value || groupContext) {
    return
  }

  setFieldTouched(true)
  setFocused(false)

  if (validationMode.value === 'onBlur') {
    void validation.commit(checked.value ? props.value : null)
  }
}

const state = computed<RadioRootState>(() => ({
  ...fieldState.value,
  checked: checked.value,
  disabled: disabled.value,
  readOnly: readOnly.value,
  required: required.value,
}))

provide(radioRootContextKey, state)

defineExpose({
  element: controlRef,
  inputElement: inputElementRef,
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
    'aria-describedby': _ariaDescribedBy,
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
      onKeydown: handleRootKeydown,
    }),
  )

  return mergeProps(
    buttonProps,
    combineDescriptionProps(
      localDescriptionProps,
      validationProps,
      { 'aria-describedby': attrsObject['aria-describedby'] },
    ),
    {
      'id': props.nativeButton ? controlId.value : rootElementId,
      'role': 'radio',
      'aria-checked': checked.value,
      'aria-readonly': readOnly.value || undefined,
      'aria-required': required.value || undefined,
      'aria-labelledby': ariaLabelledBy.value,
      [ACTIVE_COMPOSITE_ITEM]: checked.value ? '' : undefined,
      'onFocus': handleRootFocus,
      'onBlur': handleRootBlur,
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

const compositeItemRefs = mergedRootRef ? [mergedRootRef] : []
const compositeItemProps = [() => rootProps.value]

const inputProps = computed(() => {
  const validationProps = groupContext
    ? validation.getValidationProps()
    : validation.getInputValidationProps()

  return mergeProps(
    {
      'checked': checked.value,
      'disabled': disabled.value,
      'form': form.value,
      'id': inputId.value,
      'name': name.value,
      'readOnly': readOnly.value,
      'required': required.value,
      'ref': mergedInputRef,
      'type': 'radio',
      'aria-hidden': true,
      'tabindex': -1,
      'style': name.value ? visuallyHiddenInput : visuallyHidden,
      'onClick': handleInputClick,
      'onChange': handleInputChange,
      onFocus() {
        controlRef.value?.focus()
      },
    },
    props.value !== undefined
      ? { value: serializeValue(props.value) }
      : EMPTY_OBJECT,
    validationProps,
  )
})
</script>

<template>
  <CompositeItem
    v-if="groupContext"
    v-slot="slotProps"
    :as="as"
    :class="props.class"
    :style="props.style"
    :state="state"
    :refs="compositeItemRefs"
    :props="compositeItemProps"
    :state-attributes-mapping="stateAttributesMapping"
  >
    <slot v-bind="slotProps" />
  </CompositeItem>
  <slot v-else-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
  <input v-bind="inputProps">
</template>
