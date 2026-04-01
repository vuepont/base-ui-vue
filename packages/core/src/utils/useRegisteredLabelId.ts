import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue, watchSyncEffect } from 'vue'
import { useBaseUiId } from './useBaseUiId'

export function useRegisteredLabelId(
  idProp: MaybeRefOrGetter<string | undefined>,
  setLabelId: (id: string | undefined) => void,
) {
  const generatedId = useBaseUiId()
  const id = computed(() => toValue(idProp) ?? generatedId)

  watchSyncEffect((onCleanup) => {
    setLabelId(id.value)

    onCleanup(() => {
      setLabelId(undefined)
    })
  })

  return id
}
