import type { Ref } from 'vue'
import { watchEffect } from 'vue'
import { useFormContext } from '../form/FormContext'
import { useFieldRootContext } from './root/FieldRootContext'
import { getCombinedFieldValidityData } from './utils/getCombinedFieldValidityData'

const initializedValidityData = new WeakSet<object>()

export interface UseFieldParameters {
  enabled?: Ref<boolean>
  value: Ref<unknown>
  getValue?: () => unknown
  id: Ref<string | undefined>
  name?: Ref<string | undefined>
  commit: (value: unknown) => void
  controlRef: { value: HTMLElement | null }
}

export function useField(params: UseFieldParameters) {
  const { enabled, value, id, name, controlRef, commit } = params

  const { formRef } = useFormContext()
  const { invalid, markedDirtyRef, validityData, setValidityData } = useFieldRootContext()

  const getValue = params.getValue ?? (() => value.value)

  watchEffect(() => {
    if (enabled && !enabled.value) {
      return
    }

    if (initializedValidityData.has(validityData)) {
      return
    }

    let initialValue = value.value
    if (initialValue === undefined) {
      initialValue = getValue()
    }

    setValidityData({ ...validityData.value, initialValue })
    initializedValidityData.add(validityData)
  })

  watchEffect((onCleanup) => {
    if (enabled && !enabled.value) {
      return
    }

    const currentId = id.value
    if (!currentId) {
      return
    }

    const fields = formRef.value.fields

    fields.set(currentId, {
      getValue,
      name: name?.value,
      controlRef,
      validityData: getCombinedFieldValidityData(validityData.value, invalid.value),
      validate() {
        let nextValue = value.value
        if (nextValue === undefined) {
          nextValue = getValue()
        }

        markedDirtyRef.value = true

        commit(nextValue)
      },
    })

    onCleanup(() => {
      fields.delete(currentId)
    })
  })
}
