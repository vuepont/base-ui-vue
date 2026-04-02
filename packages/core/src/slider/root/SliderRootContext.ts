import type { InjectionKey, Ref, ShallowRef } from 'vue'
import type { CompositeMetadata } from '../../composite/list/CompositeList.vue'
import type { UseFieldValidationReturnValue } from '../../field/root/useFieldValidation'
import type { BaseUIChangeEventDetails, BaseUIGenericEventDetails } from '../../utils/createBaseUIEventDetails'
import type { REASONS } from '../../utils/reasons'
import type { Orientation } from '../../utils/types'
import type { ThumbMetadata } from '../thumb/SliderThumb.vue'
import type { IntlNumberFormatOptionsRef, SliderRootState } from './SliderRoot.vue'
import { inject } from 'vue'

export interface SliderRootContext {
  /**
   * The index of the active thumb.
   */
  active: Ref<number>
  /**
   * The index of the most recently interacted thumb.
   */
  lastUsedThumbIndex: Ref<number>
  controlRef: Ref<HTMLElement | null>
  dragging: Ref<boolean>
  disabled: Ref<boolean>
  validation: UseFieldValidationReturnValue
  formatOptionsRef: IntlNumberFormatOptionsRef
  handleInputChange: (
    valueInput: number,
    index: number,
    event: KeyboardEvent | Event,
  ) => void
  indicatorPosition: Ref<(number | undefined)[]>
  inset: Ref<boolean>
  labelId: Ref<string | undefined>
  rootLabelId: Ref<string | undefined>
  /**
   * The large step value of the slider when incrementing or decrementing while the shift key is held,
   * or when using Page-Up or Page-Down keys. Snaps to multiples of this value.
   * @default 10
   */
  largeStep: Ref<number>
  lastChangedValueRef: Ref<number | readonly number[] | null>
  lastChangeReasonRef: Ref<SliderRootChangeReason>
  /**
   * The locale used by `Intl.NumberFormat` when formatting the value.
   * Defaults to the user's runtime locale.
   */
  locale: Ref<Intl.LocalesArgument | undefined>
  /**
   * The maximum allowed value of the slider.
   */
  max: Ref<number>
  /**
   * The minimum allowed value of the slider.
   */
  min: Ref<number>
  /**
   * The minimum steps between values in a range slider.
   */
  minStepsBetweenValues: Ref<number>
  form: Ref<string | undefined>
  name: Ref<string | undefined>
  /**
   * Function to be called when drag ends and the pointer is released.
   */
  onValueCommitted: (
    value: number | readonly number[],
    details: BaseUIGenericEventDetails<SliderRootChangeReason>,
  ) => void
  /**
   * The component orientation.
   * @default 'horizontal'
   */
  orientation: Ref<Orientation>
  pressedInputRef: Ref<HTMLInputElement | null>
  pressedThumbCenterOffsetRef: Ref<number | null>
  pressedThumbIndexRef: Ref<number>
  pressedValuesRef: Ref<readonly number[] | null>
  registerFieldControlRef: (element: HTMLElement | null) => void
  renderBeforeHydration: Ref<boolean>
  setActive: (value: number) => void
  setDragging: (value: boolean) => void
  setIndicatorPosition: (updater: (prev: (number | undefined)[]) => (number | undefined)[]) => void
  setLabelId: (value: string | undefined) => void
  /**
   * Callback fired when dragging and invokes onValueChange.
   */
  setValue: (
    value: number | number[],
    details?: BaseUIChangeEventDetails<SliderRootChangeReason, { activeThumbIndex: number }>,
  ) => void
  state: Ref<SliderRootState>
  /**
   * The step increment of the slider when incrementing or decrementing. It will snap
   * to multiples of this value. Decimal values are supported.
   * @default 1
   */
  step: Ref<number>
  thumbCollisionBehavior: Ref<'push' | 'swap' | 'none'>
  thumbMap: ShallowRef<Map<Element, CompositeMetadata<ThumbMetadata> | null>>
  thumbRefs: Ref<(HTMLElement | null)[]>
  /**
   * The value(s) of the slider
   */
  values: Ref<readonly number[]>
}

export type SliderRootChangeReason
  = | typeof REASONS.inputChange
    | typeof REASONS.trackPress
    | typeof REASONS.drag
    | typeof REASONS.keyboard
    | typeof REASONS.none

export const sliderRootContextKey: InjectionKey<SliderRootContext> = Symbol('SliderRootContext')

export function useSliderRootContext(optional: true): SliderRootContext | undefined
export function useSliderRootContext(optional?: false): SliderRootContext
export function useSliderRootContext(optional = false) {
  const context = inject(sliderRootContextKey, undefined)
  if (!context && !optional) {
    throw new Error(
      'Base UI Vue: SliderRootContext is missing. Slider parts must be placed within <SliderRoot>.',
    )
  }

  return context
}
