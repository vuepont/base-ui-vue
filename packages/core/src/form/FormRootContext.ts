import type { InjectionKey, Ref, ShallowRef } from 'vue'
import { inject } from 'vue'
import { EMPTY_OBJECT, NOOP } from '../utils/empty'

export type FormErrors = Record<string, string | string[]>

export type FormValidationMode = 'onSubmit' | 'onBlur' | 'onChange'

export interface FormFieldValidityState {
  badInput: boolean
  customError: boolean
  patternMismatch: boolean
  rangeOverflow: boolean
  rangeUnderflow: boolean
  stepMismatch: boolean
  tooLong: boolean
  tooShort: boolean
  typeMismatch: boolean
  valueMissing: boolean
  valid: boolean | null
}

export interface FormFieldValidityData {
  state: FormFieldValidityState
  error: string
  errors: string[]
  value: unknown
  initialValue: unknown
}

export interface FormField {
  name: string | undefined
  validate: (flushSync?: boolean) => void
  validityData: FormFieldValidityData
  controlRef: { value: HTMLElement | null }
  getValue: () => unknown
}

export interface FormRootContext {
  errors: Ref<FormErrors>
  clearErrors: (name: string | undefined) => void
  formRef: ShallowRef<{ fields: Map<string, FormField> }>
  validationMode: Ref<FormValidationMode>
  submitAttempted: Ref<boolean>
}

export const formRootContextKey: InjectionKey<FormRootContext> = Symbol('FormRootContext')

const defaultContext: FormRootContext = {
  errors: { value: EMPTY_OBJECT as FormErrors } as Ref<FormErrors>,
  clearErrors: NOOP,
  formRef: { value: { fields: new Map() } } as ShallowRef<{ fields: Map<string, FormField> }>,
  validationMode: { value: 'onSubmit' } as Ref<FormValidationMode>,
  submitAttempted: { value: false } as Ref<boolean>,
}

export function useFormRootContext(): FormRootContext {
  return inject(formRootContextKey, defaultContext)
}
