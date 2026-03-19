import type { Ref } from 'vue'
import type { FieldValidityData } from './FieldRoot.vue'
import { computed, ref } from 'vue'
import { DEFAULT_VALIDITY_STATE } from '../utils/constants'

export interface UseFieldValidityReturnValue {
  validityData: Ref<FieldValidityData>
  setValidityData: (data: FieldValidityData) => void
  valid: Readonly<Ref<boolean | null>>
}

export function useFieldValidity(params: { invalid: Ref<boolean> }): UseFieldValidityReturnValue {
  const { invalid } = params

  const validityData = ref<FieldValidityData>({
    state: { ...DEFAULT_VALIDITY_STATE },
    error: '',
    errors: [],
    value: null,
    initialValue: null,
  })

  function setValidityData(data: FieldValidityData) {
    validityData.value = data
  }

  const valid = computed(() => !invalid.value && validityData.value.state.valid)

  return { validityData, setValidityData, valid }
}
