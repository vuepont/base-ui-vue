import { computed, onUnmounted } from 'vue'
import { useBaseUiId } from '../utils/useBaseUiId'
import { useLabelableContext } from './LabelableContext'

export interface UseLabelableIdParameters {
  id?: string
}

export function useLabelableId(params: UseLabelableIdParameters = {}) {
  const { id } = params
  const { controlId, setControlId } = useLabelableContext()

  const defaultId = useBaseUiId(id)
  const resolvedId = id ?? defaultId

  if (resolvedId) {
    setControlId(resolvedId)
  }

  onUnmounted(() => {
    setControlId(undefined)
  })

  return computed(() => controlId.value ?? defaultId)
}
