import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { ProgressRootState, ProgressStatus } from './ProgressRoot.vue'
import { inject } from 'vue'

export interface ProgressRootContext {
  /**
   * The formatted current value of the progress bar.
   * Empty string when the component is indeterminate.
   */
  formattedValue: Ref<string>
  /**
   * The maximum allowed value of the progress bar.
   */
  max: Ref<number>
  /**
   * The minimum allowed value of the progress bar.
   */
  min: Ref<number>
  /**
   * The raw current value, or `null` when indeterminate.
   */
  value: Ref<number | null>
  /**
   * Derived completion status. Used to produce `data-*` state attributes.
   */
  status: ComputedRef<ProgressStatus>
  /**
   * The state of the root component.
   */
  state: ComputedRef<ProgressRootState>
  /**
   * Registers the DOM id of the `<ProgressLabel>` for `aria-labelledby`.
   */
  setLabelId: (id: string | undefined) => void
}

export const progressRootContextKey: InjectionKey<ProgressRootContext>
  = Symbol('ProgressRootContext')

export function useProgressRootContext(optional: true): ProgressRootContext | undefined
export function useProgressRootContext(optional?: false): ProgressRootContext
export function useProgressRootContext(optional = false) {
  const context = inject(progressRootContextKey, undefined)
  if (!context && !optional) {
    throw new Error(
      'Base UI Vue: ProgressRootContext is missing. Progress parts must be placed within <ProgressRoot>.',
    )
  }

  return context
}
