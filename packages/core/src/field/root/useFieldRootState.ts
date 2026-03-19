import type { Ref } from 'vue'
import type { FieldRootState } from './FieldRoot.vue'
import { computed, shallowRef } from 'vue'

export interface UseFieldRootStateParameters {
  disabled: Ref<boolean>
  touchedProp: Ref<boolean | undefined>
  dirtyProp: Ref<boolean | undefined>
}

export interface UseFieldRootStateReturnValue {
  touched: Readonly<Ref<boolean>>
  dirty: Readonly<Ref<boolean>>
  filled: Readonly<Ref<boolean>>
  focused: Readonly<Ref<boolean>>
  setTouched: (value: boolean) => void
  setDirty: (value: boolean) => void
  setFilled: (value: boolean) => void
  setFocused: (value: boolean) => void
  markedDirtyRef: Ref<boolean>
  stateWithoutValidity: Readonly<Ref<Pick<FieldRootState, 'disabled' | 'touched' | 'dirty' | 'filled' | 'focused'>>>
}

export function useFieldRootState(params: UseFieldRootStateParameters): UseFieldRootStateReturnValue {
  const { disabled, touchedProp, dirtyProp } = params

  const touchedState = shallowRef(false)
  const dirtyState = shallowRef(false)
  const filled = shallowRef(false)
  const focused = shallowRef(false)
  const markedDirtyRef = shallowRef(false)

  const touched = computed(() => touchedProp.value ?? touchedState.value)
  const dirty = computed(() => dirtyProp.value ?? dirtyState.value)

  function setDirty(value: boolean) {
    if (dirtyProp.value !== undefined) {
      return
    }
    if (value) {
      markedDirtyRef.value = true
    }
    dirtyState.value = value
  }

  function setTouched(value: boolean) {
    if (touchedProp.value !== undefined) {
      return
    }
    touchedState.value = value
  }

  function setFilled(value: boolean) {
    filled.value = value
  }

  function setFocused(value: boolean) {
    focused.value = value
  }

  const stateWithoutValidity = computed(() => ({
    disabled: disabled.value,
    touched: touched.value,
    dirty: dirty.value,
    filled: filled.value,
    focused: focused.value,
  }))

  return {
    touched,
    dirty,
    filled,
    focused,
    setTouched,
    setDirty,
    setFilled,
    setFocused,
    markedDirtyRef,
    stateWithoutValidity,
  }
}
