import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface MeterRootContext {
  /**
   * The formatted current value of the meter.
   */
  formattedValue: Ref<string>
  /**
   * The maximum allowed value of the meter.
   */
  max: Ref<number>
  /**
   * The minimum allowed value of the meter.
   */
  min: Ref<number>
  /**
   * The raw current value of the meter.
   */
  value: Ref<number>
  /**
   * Registers the DOM id of the `<MeterLabel>` for `aria-labelledby`.
   */
  setLabelId: (id: string | undefined) => void
}

export const meterRootContextKey: InjectionKey<MeterRootContext>
  = Symbol('MeterRootContext')

export function useMeterRootContext(optional: true): MeterRootContext | undefined
export function useMeterRootContext(optional?: false): MeterRootContext
export function useMeterRootContext(optional = false) {
  const context = inject(meterRootContextKey, undefined)
  if (!context && !optional) {
    throw new Error(
      'Base UI Vue: MeterRootContext is missing. Meter parts must be placed within <MeterRoot>.',
    )
  }

  return context
}
