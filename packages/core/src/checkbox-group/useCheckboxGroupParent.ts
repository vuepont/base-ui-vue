import type { Ref } from 'vue'
import type { BaseUIChangeEventDetails } from '../utils/createBaseUIEventDetails'
import type { REASONS } from '../utils/reasons'
import { computed, ref } from 'vue'
import { useBaseUiId } from '../utils/useBaseUiId'

export interface UseCheckboxGroupParentParameters {
  allValues: Readonly<Ref<string[] | undefined>>
  value: Readonly<Ref<string[]>>
  onValueChange: (
    value: string[],
    eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
  ) => void
}

export interface UseCheckboxGroupParentReturnValue {
  id: string | undefined
  indeterminate: Readonly<Ref<boolean>>
  disabledStatesRef: Ref<Map<string, boolean>>
  getParentProps: () => {
    'id': string | undefined
    'indeterminate': boolean
    'checked': boolean
    'aria-controls': string
    'onCheckedChange': (
      checked: boolean,
      eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
    ) => void
  }
  getChildProps: (value: string) => {
    checked: boolean
    onCheckedChange: (
      checked: boolean,
      eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
    ) => void
  }
}

export function useCheckboxGroupParent(
  params: UseCheckboxGroupParentParameters,
): UseCheckboxGroupParentReturnValue {
  const { allValues, value, onValueChange } = params
  const resolvedAllValues = computed(() => allValues.value ?? [])

  const uncontrolledStateRef = ref<string[]>(value.value)
  const disabledStatesRef = ref(new Map<string, boolean>())
  const status = ref<'on' | 'off' | 'mixed'>('mixed')

  const id = useBaseUiId()
  const checked = computed(() => value.value.length === resolvedAllValues.value.length)
  const indeterminate = computed(() =>
    value.value.length !== resolvedAllValues.value.length && value.value.length > 0,
  )

  function getParentProps() {
    return {
      id,
      'indeterminate': indeterminate.value,
      'checked': checked.value,
      'aria-controls': resolvedAllValues.value.map(item => `${id}-${item}`).join(' '),
      onCheckedChange(
        _nextChecked: boolean,
        eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
      ) {
        const uncontrolledState = uncontrolledStateRef.value

        const none = resolvedAllValues.value.filter(
          (item: string) =>
            disabledStatesRef.value.get(item) && uncontrolledState.includes(item),
        )

        const all = resolvedAllValues.value.filter(
          (item: string) =>
            !disabledStatesRef.value.get(item)
            || (disabledStatesRef.value.get(item) && uncontrolledState.includes(item)),
        )

        const allOnOrOff
          = uncontrolledState.length === all.length || uncontrolledState.length === 0

        if (allOnOrOff) {
          if (value.value.length === all.length) {
            onValueChange(none, eventDetails)
          }
          else {
            onValueChange(all, eventDetails)
          }
          return
        }

        if (status.value === 'mixed') {
          onValueChange(all, eventDetails)
          status.value = 'on'
        }
        else if (status.value === 'on') {
          onValueChange(none, eventDetails)
          status.value = 'off'
        }
        else {
          onValueChange(uncontrolledState, eventDetails)
          status.value = 'mixed'
        }
      },
    }
  }

  function getChildProps(childValue: string) {
    return {
      checked: value.value.includes(childValue),
      onCheckedChange(
        nextChecked: boolean,
        eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
      ) {
        const newValue = value.value.slice()

        if (nextChecked) {
          if (!newValue.includes(childValue)) {
            newValue.push(childValue)
          }
        }
        else {
          const index = newValue.indexOf(childValue)
          if (index !== -1) {
            newValue.splice(index, 1)
          }
        }

        uncontrolledStateRef.value = newValue
        onValueChange(newValue, eventDetails)
        status.value = 'mixed'
      },
    }
  }

  return {
    id,
    indeterminate,
    disabledStatesRef,
    getParentProps,
    getChildProps,
  }
}
