import { computed, watchEffect } from 'vue'
import { useBaseUiId } from '../utils/useBaseUiId'
import { useLabelableContext } from './LabelableContext'

export interface UseLabelableIdParameters {
  id?: string
}

export function useLabelableId(params: UseLabelableIdParameters = {}) {
  const { id } = params
  const { controlId, registerControlId } = useLabelableContext()
  const source = Symbol('labelable-id')

  const defaultId = useBaseUiId(id)
  const resolvedId = id ?? defaultId

  watchEffect((onCleanup) => {
    if (!resolvedId) {
      registerControlId(source, undefined)
      return
    }

    registerControlId(source, resolvedId)

    onCleanup(() => {
      registerControlId(source, undefined)
    })
  })

  return computed(() => controlId.value ?? defaultId)
}
