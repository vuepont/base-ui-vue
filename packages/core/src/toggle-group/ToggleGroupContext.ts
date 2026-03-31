import type { InjectionKey, Ref } from 'vue'
import type { BaseUIChangeEventDetails } from '../utils/createBaseUIEventDetails'
import type { REASONS } from '../utils/reasons'
import type { Orientation } from '../utils/types'
import { inject } from 'vue'

export interface ToggleGroupContext<Value> {
  value: Readonly<Ref<Value[]>>
  setGroupValue: (
    newValue: Value,
    nextPressed: boolean,
    eventDetails: BaseUIChangeEventDetails<typeof REASONS.none>,
  ) => void
  disabled: Readonly<Ref<boolean>>
  orientation: Readonly<Ref<Orientation>>
  /**
   * Indicates whether the value has been initialized via `value` or `defaultValue` props.
   * Used to determine if Toggle should warn users about data inconsistency problems.
   */
  isValueInitialized: Readonly<Ref<boolean>>
}

export const toggleGroupContextKey: InjectionKey<ToggleGroupContext<any>>
  = Symbol('ToggleGroupContext')

export function useToggleGroupContext<Value>(
  optional: true,
): ToggleGroupContext<Value> | undefined
export function useToggleGroupContext<Value>(
  optional?: false,
): ToggleGroupContext<Value>
export function useToggleGroupContext<Value>(optional = false) {
  const context = inject<ToggleGroupContext<Value> | undefined>(
    toggleGroupContextKey,
    undefined,
  )

  if (context === undefined && !optional) {
    throw new Error(
      'Base UI Vue: ToggleGroupContext is missing. ToggleGroup parts must be placed within <ToggleGroup>.',
    )
  }

  return context
}
