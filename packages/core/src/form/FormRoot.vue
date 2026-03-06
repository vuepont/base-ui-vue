<script setup lang="ts">
import type { BaseUIComponentProps } from '../utils/types'
import type { FormErrors, FormField, FormRootContext, FormValidationMode } from './FormRootContext'
import { computed, provide, ref, shallowRef, useAttrs, watch } from 'vue'
import { EMPTY_OBJECT } from '../utils/empty'
import { formRootContextKey } from './FormRootContext'

export interface FormActions {
  validate: (fieldName?: string) => void
}

export interface FormState {}

export interface FormRootProps extends BaseUIComponentProps<FormState> {
  /**
   * Determines when the form should be validated.
   *
   * - `onSubmit` (default): validates on submit, re-validates on change after submission.
   * - `onBlur`: validates when a control loses focus.
   * - `onChange`: validates on every change.
   *
   * @default 'onSubmit'
   */
  validationMode?: FormValidationMode
  /**
   * Validation errors returned externally (e.g. from a server).
   * Keys correspond to the `name` attribute on `<FieldRoot>`.
   */
  errors?: FormErrors
  /**
   * Whether native form validation is disabled.
   * @default true
   */
  noValidate?: boolean
}

defineOptions({
  name: 'FormRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FormRootProps>(), {
  as: 'form',
  validationMode: 'onSubmit',
  noValidate: true,
})

const emit = defineEmits<{
  formSubmit: [formValues: Record<string, unknown>, event: Event]
}>()

const attrs = useAttrs()

const formRef = shallowRef<{ fields: Map<string, FormField> }>({ fields: new Map() })
const submittedRef = ref(false)
const submitAttemptedRef = ref(false)
const internalErrors = ref<FormErrors>(props.errors ?? (EMPTY_OBJECT as FormErrors))

watch(
  () => props.errors,
  (newErrors) => {
    if (newErrors !== undefined) {
      internalErrors.value = newErrors
    }
  },
)

function focusControl(el: HTMLElement | null) {
  if (!el)
    return
  el.focus()
  if (el.tagName === 'INPUT') {
    (el as HTMLInputElement).select()
  }
}

watch(internalErrors, () => {
  if (!submittedRef.value)
    return

  submittedRef.value = false

  const invalidFields = Array.from(formRef.value.fields.values()).filter(
    field => field.validityData.state.valid === false,
  )

  if (invalidFields.length) {
    const controlRef = invalidFields[0].controlRef
    focusControl(controlRef.value)
  }
})

function handleImperativeValidate(fieldName?: string) {
  const values = Array.from(formRef.value.fields.values())

  if (fieldName) {
    const namedField = values.find(field => field.name === fieldName)
    if (namedField) {
      namedField.validate(false)
    }
  }
  else {
    values.forEach((field) => {
      field.validate(false)
    })
  }
}

const actionsRef = ref<FormActions>({ validate: handleImperativeValidate })

function clearErrors(name: string | undefined) {
  if (name && internalErrors.value && Object.prototype.hasOwnProperty.call(internalErrors.value, name)) {
    const nextErrors = { ...internalErrors.value }
    delete nextErrors[name]
    internalErrors.value = nextErrors
  }
}

const validationModeRef = computed(() => props.validationMode)

const contextValue: FormRootContext = {
  formRef,
  validationMode: validationModeRef,
  errors: internalErrors,
  clearErrors,
  submitAttempted: submitAttemptedRef,
}

provide(formRootContextKey, contextValue)

function handleSubmit(event: Event) {
  submitAttemptedRef.value = true

  let values = Array.from(formRef.value.fields.values())

  values.forEach((field) => {
    field.validate()
  })

  values = Array.from(formRef.value.fields.values())

  const invalidFields = values.filter(field => !field.validityData.state.valid)

  if (invalidFields.length) {
    event.preventDefault()
    const controlRef = invalidFields[0].controlRef
    focusControl(controlRef.value)
  }
  else {
    submittedRef.value = true

    event.preventDefault()

    const formValues = values.reduce((acc, field) => {
      if (field.name) {
        acc[field.name] = field.getValue()
      }
      return acc
    }, {} as Record<string, unknown>)

    emit('formSubmit', formValues, event)
  }
}

const mergedProps = computed(() => {
  const baseProps: Record<string, any> = {
    ...attrs,
    novalidate: props.noValidate || undefined,
    class: typeof props.class === 'function' ? props.class({}) : props.class,
    style: typeof props.style === 'function' ? props.style({}) : props.style,
    onSubmit: handleSubmit,
  }

  return baseProps
})

defineExpose({
  actions: actionsRef.value,
})
</script>

<template>
  <component :is="props.as" v-bind="mergedProps">
    <slot :actions="actionsRef" />
  </component>
</template>
