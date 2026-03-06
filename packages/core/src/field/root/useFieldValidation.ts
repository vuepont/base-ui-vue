import type { Ref } from 'vue'
import type { FieldRootState, FieldValidityData } from './FieldRoot.vue'
import { ref } from 'vue'
import { useFormContext } from '../../form/FormContext'
import { useTimeout } from '../../utils/useTimeout'
import { DEFAULT_VALIDITY_STATE } from '../utils/constants'
import { getCombinedFieldValidityData } from '../utils/getCombinedFieldValidityData'

const validityKeys = Object.keys(DEFAULT_VALIDITY_STATE) as Array<keyof ValidityState>

function isOnlyValueMissing(state: Record<keyof ValidityState, boolean> | undefined) {
  if (!state || state.valid || !state.valueMissing) {
    return false
  }
  let onlyValueMissing = false
  for (const key of validityKeys) {
    if (key === 'valid')
      continue
    if (key === 'valueMissing') {
      onlyValueMissing = state[key]
    }
    if (state[key]) {
      onlyValueMissing = false
    }
  }
  return onlyValueMissing
}

export interface UseFieldValidationParameters {
  controlId: Ref<string | null | undefined>
  getDescriptionProps: () => Record<string, string | undefined>
  setValidityData: (data: FieldValidityData) => void
  validate: (
    value: unknown,
    formValues: Record<string, unknown>,
  ) => string | string[] | null | Promise<string | string[] | null>
  validityData: Ref<FieldValidityData>
  validationDebounceTime: Ref<number>
  invalid: Ref<boolean>
  markedDirtyRef: Ref<boolean>
  state: Ref<FieldRootState>
  name: Ref<string | undefined>
  shouldValidateOnChange: () => boolean
}

export interface UseFieldValidationReturnValue {
  getValidationProps: () => Record<string, any>
  getInputValidationProps: () => Record<string, any>
  inputRef: Ref<HTMLInputElement | null>
  commit: (value: unknown, revalidate?: boolean) => Promise<void>
}

export function useFieldValidation(
  params: UseFieldValidationParameters,
): UseFieldValidationReturnValue {
  const { formRef, clearErrors } = useFormContext()

  const {
    controlId,
    getDescriptionProps,
    setValidityData,
    validate,
    validityData,
    validationDebounceTime,
    invalid,
    markedDirtyRef,
    state,
    name,
    shouldValidateOnChange,
  } = params

  const timeout = useTimeout()
  const inputRef = ref<HTMLInputElement | null>(null)

  async function commit(value: unknown, revalidate = false) {
    const element = inputRef.value
    if (!element) {
      return
    }

    if (revalidate) {
      if (state.value.valid !== false) {
        return
      }

      const currentNativeValidity = element.validity

      if (!currentNativeValidity.valueMissing) {
        const nextValidityData: FieldValidityData = {
          value,
          state: { ...DEFAULT_VALIDITY_STATE, valid: true },
          error: '',
          errors: [],
          initialValue: validityData.value.initialValue,
        }
        element.setCustomValidity('')

        const cId = controlId.value
        if (cId) {
          const currentFieldData = formRef.value.fields.get(cId)
          if (currentFieldData) {
            formRef.value.fields.set(cId, {
              ...currentFieldData,
              validityData: getCombinedFieldValidityData(nextValidityData, false),
            })
          }
        }
        setValidityData(nextValidityData)
        return
      }

      const currentNativeValidityObject = validityKeys.reduce(
        (acc, key) => {
          acc[key] = currentNativeValidity[key]
          return acc
        },
        {} as Record<keyof ValidityState, boolean>,
      )

      if (!currentNativeValidityObject.valid && !isOnlyValueMissing(currentNativeValidityObject)) {
        return
      }
    }

    function getState(el: HTMLInputElement) {
      const computedState = validityKeys.reduce(
        (acc, key) => {
          acc[key] = el.validity[key]
          return acc
        },
        {} as Record<keyof ValidityState, boolean>,
      )

      let hasOnlyValueMissingError = false

      for (const key of validityKeys) {
        if (key === 'valid')
          continue
        if (key === 'valueMissing' && computedState[key]) {
          hasOnlyValueMissingError = true
        }
        else if (computedState[key]) {
          return computedState
        }
      }

      if (hasOnlyValueMissingError && !markedDirtyRef.value) {
        computedState.valid = true
        computedState.valueMissing = false
      }
      return computedState
    }

    timeout.clear()

    let result: null | string | string[] = null
    let validationErrors: string[] = []

    const nextState = getState(element)

    let defaultValidationMessage: string | undefined
    const validateOnChange = shouldValidateOnChange()

    if (element.validationMessage && !validateOnChange) {
      defaultValidationMessage = element.validationMessage
      validationErrors = [element.validationMessage]
    }
    else {
      const formValues = Array.from(formRef.value.fields.values()).reduce((acc, field) => {
        if (field.name) {
          acc[field.name] = field.getValue()
        }
        return acc
      }, {} as Record<string, unknown>)

      const resultOrPromise = validate(value, formValues)
      if (
        typeof resultOrPromise === 'object'
        && resultOrPromise !== null
        && 'then' in resultOrPromise
      ) {
        result = await resultOrPromise
      }
      else {
        result = resultOrPromise
      }

      if (result !== null) {
        nextState.valid = false
        nextState.customError = true

        if (Array.isArray(result)) {
          validationErrors = result
          element.setCustomValidity(result.join('\n'))
        }
        else if (result) {
          validationErrors = [result]
          element.setCustomValidity(result)
        }
      }
      else if (validateOnChange) {
        element.setCustomValidity('')
        nextState.customError = false

        if (element.validationMessage) {
          defaultValidationMessage = element.validationMessage
          validationErrors = [element.validationMessage]
        }
        else if (element.validity.valid && !nextState.valid) {
          nextState.valid = true
        }
      }
    }

    const nextValidityData: FieldValidityData = {
      value,
      state: nextState,
      error: defaultValidationMessage ?? (Array.isArray(result) ? result[0] : (result ?? '')),
      errors: validationErrors,
      initialValue: validityData.value.initialValue,
    }

    const cId = controlId.value
    if (cId) {
      const currentFieldData = formRef.value.fields.get(cId)
      if (currentFieldData) {
        formRef.value.fields.set(cId, {
          ...currentFieldData,
          validityData: getCombinedFieldValidityData(nextValidityData, invalid.value),
        })
      }
    }

    setValidityData(nextValidityData)
  }

  function getValidationProps() {
    const descProps = getDescriptionProps()
    const ariaInvalid = state.value.valid === false ? { 'aria-invalid': true as const } : {}
    return { ...descProps, ...ariaInvalid }
  }

  function getInputValidationProps() {
    return {
      onInput(event: Event) {
        const target = event.target as HTMLInputElement

        clearErrors(name.value)

        if (!shouldValidateOnChange()) {
          commit(target.value, true)
          return
        }

        const element = target

        if (element.value === '') {
          commit(element.value)
          return
        }

        timeout.clear()

        if (validationDebounceTime.value) {
          timeout.start(validationDebounceTime.value, () => {
            commit(element.value)
          })
        }
        else {
          commit(element.value)
        }
      },
      ...getValidationProps(),
    }
  }

  return {
    getValidationProps,
    getInputValidationProps,
    inputRef,
    commit,
  }
}
