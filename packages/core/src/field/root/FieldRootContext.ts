import type { InjectionKey, Ref } from 'vue'
import type { FormValidationMode } from '../../form/FormContext'
import type { FieldRootState, FieldValidityData } from './FieldRoot.vue'
import type { UseFieldValidationReturnValue } from './useFieldValidation'
import { inject, ref, shallowReadonly, shallowRef } from 'vue'
import { NOOP } from '../../utils/empty'
import { DEFAULT_FIELD_ROOT_STATE, DEFAULT_VALIDITY_STATE } from '../utils/constants'

export interface FieldRootContext {
  invalid: Readonly<Ref<boolean | undefined>>
  name: Readonly<Ref<string | undefined>>
  validityData: Readonly<Ref<FieldValidityData>>
  setValidityData: (data: FieldValidityData) => void
  disabled: Readonly<Ref<boolean>>
  touched: Readonly<Ref<boolean>>
  setTouched: (value: boolean) => void
  dirty: Readonly<Ref<boolean>>
  setDirty: (value: boolean) => void
  filled: Readonly<Ref<boolean>>
  setFilled: (value: boolean) => void
  focused: Readonly<Ref<boolean>>
  setFocused: (value: boolean) => void
  validate: (
    value: unknown,
    formValues: Record<string, unknown>,
  ) => string | string[] | null | Promise<string | string[] | null>
  validationMode: Readonly<Ref<FormValidationMode>>
  validationDebounceTime: Readonly<Ref<number>>
  shouldValidateOnChange: () => boolean
  state: Readonly<Ref<FieldRootState>>
  markedDirtyRef: Ref<boolean>
  validation: UseFieldValidationReturnValue
}

function createDefaultContext(): FieldRootContext {
  const defaultValidation: UseFieldValidationReturnValue = {
    getValidationProps: () => ({}),
    getInputValidationProps: () => ({}),
    inputRef: shallowReadonly(shallowRef<HTMLInputElement | null>(null)),
    setInputRef: () => {},
    commit: async () => {},
  }

  return {
    invalid: ref(undefined),
    name: ref<string | undefined>(undefined),
    validityData: ref<FieldValidityData>({
      state: { ...DEFAULT_VALIDITY_STATE },
      errors: [],
      error: '',
      value: '',
      initialValue: null,
    }),
    setValidityData: NOOP,
    disabled: ref(false),
    touched: ref(false),
    setTouched: NOOP,
    dirty: ref(false),
    setDirty: NOOP,
    filled: ref(false),
    setFilled: NOOP,
    focused: ref(false),
    setFocused: NOOP,
    validate: () => null,
    validationMode: ref<FormValidationMode>('onSubmit'),
    validationDebounceTime: ref(0),
    shouldValidateOnChange: () => false,
    state: ref<FieldRootState>({ ...DEFAULT_FIELD_ROOT_STATE }),
    markedDirtyRef: ref(false),
    validation: defaultValidation,
  }
}

export const fieldRootContextKey: InjectionKey<FieldRootContext> = Symbol('FieldRootContext')

let _defaultContext: FieldRootContext | null = null

export function useFieldRootContext(optional?: true): FieldRootContext
export function useFieldRootContext(optional: false): FieldRootContext
export function useFieldRootContext(optional = true): FieldRootContext {
  const context = inject(fieldRootContextKey, undefined)

  if (!context && !optional) {
    throw new Error(
      'Base UI Vue: FieldRootContext is missing. Field parts must be placed within <FieldRoot>.',
    )
  }

  if (!context) {
    if (!_defaultContext) {
      _defaultContext = createDefaultContext()
    }
    return _defaultContext
  }

  return context
}
