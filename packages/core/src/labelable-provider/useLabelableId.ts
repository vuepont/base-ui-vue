import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue, watchEffect } from 'vue'
import { useBaseUiId } from '../utils/useBaseUiId'
import { useLabelableContext } from './LabelableContext'

export interface UseLabelableIdParameters {
  id?: MaybeRefOrGetter<string | undefined>
}

export function useLabelableId(params: UseLabelableIdParameters = {}) {
  const { id } = params
  const { controlId, registerControlId } = useLabelableContext()
  const source = Symbol('labelable-id')

  const defaultId = useBaseUiId()
  const resolvedId = computed(() => toValue(id) ?? defaultId)

  watchEffect((onCleanup) => {
    if (!resolvedId.value) {
      registerControlId(source, undefined)
      return
    }

    registerControlId(source, resolvedId.value)

    onCleanup(() => {
      registerControlId(source, undefined)
    })
  })

  return computed(() => controlId.value ?? resolvedId.value)
}
