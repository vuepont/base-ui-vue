<script setup lang="ts">
import type { ShallowRef } from 'vue'
import type { CompositeMetadata } from '../../composite/list/CompositeList.vue'
import type { FieldRootState } from '../../field/root/FieldRoot.vue'
import type { BaseUIChangeEventDetails, BaseUIGenericEventDetails } from '../../utils/createBaseUIEventDetails'
import type { BaseUIComponentProps, Orientation } from '../../utils/types'
import type { ThumbMetadata } from '../thumb/SliderThumb.vue'
import { computed, provide, ref, shallowRef, useAttrs, watch } from 'vue'
import CompositeList from '../../composite/list/CompositeList.vue'
import { useFieldRootContext } from '../../field/root/FieldRootContext'
import { useField } from '../../field/useField'
import { activeElement, contains } from '../../floating-ui-vue/utils'
import { useFormContext } from '../../form/FormContext'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { mergeProps } from '../../merge-props/mergeProps'
import { areArraysEqual } from '../../utils/areArraysEqual'
import { clamp } from '../../utils/clamp'
import { createChangeEventDetails, createGenericEventDetails } from '../../utils/createBaseUIEventDetails'
import { ownerDocument } from '../../utils/owner'
import { REASONS } from '../../utils/reasons'
import { getDefaultLabelId, resolveAriaLabelledBy } from '../../utils/resolveAriaLabelledBy'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useControllableState } from '../../utils/useControllableState'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { useRenderElement } from '../../utils/useRenderElement'
import { warn } from '../../utils/warn'
import { asc } from '../utils/asc'
import { getSliderValue } from '../utils/getSliderValue'
import { validateMinimumDistance } from '../utils/validateMinimumDistance'
import { sliderRootContextKey } from './SliderRootContext'
import { sliderStateAttributesMapping } from './stateAttributesMapping'

export type SliderRootChangeEventReason
  = | typeof REASONS.inputChange
    | typeof REASONS.trackPress
    | typeof REASONS.drag
    | typeof REASONS.keyboard
    | typeof REASONS.none

export type SliderRootCommitEventReason = SliderRootChangeEventReason

export type SliderRootChangeEventDetails = BaseUIChangeEventDetails<
  SliderRootChangeEventReason,
  {
    /**
     * The index of the active thumb at the time of the change.
     */
    activeThumbIndex: number
  }
>
export type SliderRootCommitEventDetails = BaseUIGenericEventDetails<SliderRootCommitEventReason>

export interface SliderRootState extends FieldRootState {
  /**
   * The index of the active thumb.
   */
  activeThumbIndex: number
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean
  /**
   * Whether the thumb is currently being dragged.
   */
  dragging: boolean
  /**
   * The maximum value.
   */
  max: number
  /**
   * The minimum value.
   */
  min: number
  /**
   * The minimum steps between values in a range slider.
   * @default 0
   */
  minStepsBetweenValues: number
  /**
   * The component orientation.
   */
  orientation: Orientation
  /**
   * The step increment of the slider when incrementing or decrementing. It will snap
   * to multiples of this value. Decimal values are supported.
   * @default 1
   */
  step: number
  /**
   * The raw number value of the slider.
   */
  values: readonly number[]
}

export interface SliderRootProps<Value extends number | readonly number[] = number | readonly number[]>
  extends BaseUIComponentProps<SliderRootState> {
  /**
   * The uncontrolled value of the slider when it's initially rendered.
   *
   * To render a controlled slider, use the `value` prop instead.
   */
  defaultValue?: Value
  /**
   * Whether the slider should ignore user interaction.
   * @default false
   */
  disabled?: boolean
  /**
   * Options to format the input value.
   */
  format?: Intl.NumberFormatOptions
  /**
   * The locale used by `Intl.NumberFormat` when formatting the value.
   * Defaults to the user's runtime locale.
   */
  locale?: Intl.LocalesArgument
  /**
   * The maximum allowed value of the slider.
   * Should not be equal to min.
   * @default 100
   */
  max?: number
  /**
   * The minimum allowed value of the slider.
   * Should not be equal to min.
   * @default 0
   */
  min?: number
  /**
   * The minimum steps between values in a range slider.
   * @default 0
   */
  minStepsBetweenValues?: number
  /**
   * Identifies the field when a form is submitted.
   */
  name?: string
  /**
   * Identifies the form that owns the slider inputs.
   * Useful when the slider is rendered outside the form.
   */
  form?: string
  /**
   * The component orientation.
   * @default 'horizontal'
   */
  orientation?: Orientation
  /**
   * The granularity with which the slider can step through values. (A "discrete" slider.)
   * The `min` prop serves as the origin for the valid values.
   * We recommend (max - min) to be evenly divisible by the step.
   * @default 1
   */
  step?: number
  /**
   * The granularity with which the slider can step through values when using Page Up/Page Down or Shift + Arrow Up/Arrow Down.
   * @default 10
   */
  largeStep?: number
  /**
   * How the thumb(s) are aligned relative to `Slider.Control` when the value is at `min` or `max`:
   * - `center`: The center of the thumb is aligned with the control edge
   * - `edge`: The thumb is inset within the control such that its edge is aligned with the control edge
   * - `edge-client-only`: Same as `edge` but renders after React hydration on the client, reducing bundle size in return
   * @default 'center'
   */
  thumbAlignment?: 'center' | 'edge' | 'edge-client-only'
  /**
   * Controls how thumbs behave when they collide during pointer interactions.
   *
   * - `'push'` (default): Thumbs push each other without restoring their previous positions when dragged back.
   * - `'swap'`: Thumbs swap places when dragged past each other.
   * - `'none'`: Thumbs cannot move past each other; excess movement is ignored.
   *
   * @default 'push'
   */
  thumbCollisionBehavior?: 'push' | 'swap' | 'none'
  /**
   * The value of the slider.
   * For ranged sliders, provide an array with two values.
   */
  value?: Value
  id?: string
  ariaLabelledby?: string
}

export type IntlNumberFormatOptionsRef = Readonly<{ value: Intl.NumberFormatOptions | undefined }>

/**
 * Groups all parts of the slider.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Slider](https://baseui-vue.com/docs/components/slider)
 */
defineOptions({
  name: 'SliderRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SliderRootProps>(), {
  as: 'div',
  disabled: false,
  largeStep: 10,
  max: 100,
  min: 0,
  minStepsBetweenValues: 0,
  orientation: 'horizontal',
  step: 1,
  thumbAlignment: 'center',
  thumbCollisionBehavior: 'push',
})

const emit = defineEmits<{
  /**
   * Callback function that is fired when the slider's value changed.
   * You can pull out the new value by accessing `event.target.value` (any).
   *
   * The `eventDetails.reason` indicates what triggered the change:
   *
   * - `'input-change'` when the hidden range input emits a change event (for example, via form integration)
   * - `'track-press'` when the control track is pressed
   * - `'drag'` while dragging a thumb
   * - `'keyboard'` for keyboard input
   * - `'none'` when the change is triggered without a specific interaction
   */
  valueChange: [value: number | readonly number[], details: SliderRootChangeEventDetails]
  /**
   * Callback function that is fired when the `pointerup` is triggered.
   * **Warning**: This is a generic event not a change event.
   *
   * The `eventDetails.reason` indicates what triggered the commit:
   *
   * - `'drag'` while dragging a thumb
   * - `'track-press'` when the control track is pressed
   * - `'keyboard'` for keyboard input
   * - `'input-change'` when the hidden range input emits a change event (for example, via form integration)
   * - `'none'` when the commit occurs without a specific interaction
   */
  valueCommitted: [value: number | readonly number[], details: SliderRootCommitEventDetails]
}>()

const attrs = useAttrs()
const attrsObject = attrs as Record<string, unknown>
const explicitAriaLabelledBy = computed(() =>
  props.ariaLabelledby ?? attrs['aria-labelledby'] as string | undefined,
)

const id = useBaseUiId(props.id)
const idRef = computed(() => id)
const defaultLabelId = computed(() => getDefaultLabelId(id))

const { clearErrors } = useFormContext()
const {
  state: fieldState,
  disabled: fieldDisabled,
  name: fieldName,
  setTouched,
  setDirty,
  validation,
  validityData,
  shouldValidateOnChange,
} = useFieldRootContext()
const { labelId: fieldLabelId } = useLabelableContext()

const localLabelId = ref<string | undefined>(undefined)

const ariaLabelledBy = computed(() =>
  explicitAriaLabelledBy.value ?? resolveAriaLabelledBy(fieldLabelId.value, localLabelId.value),
)
const disabled = computed(() => fieldDisabled.value || props.disabled)
const name = computed(() => fieldName.value ?? props.name)

const controllableValue = useControllableState<number | readonly number[]>({
  controlled: () => props.value,
  default: () => props.defaultValue ?? props.min,
  name: 'Slider',
  state: 'value',
})
const valueUnwrapped = controllableValue.value
const setValueUnwrapped = controllableValue.setValue

const sliderRef = ref<HTMLElement | null>(null)
const controlRef = ref<HTMLElement | null>(null)
const thumbRefs = ref<(HTMLElement | null)[]>([])
const pressedInputRef = ref<HTMLInputElement | null>(null)
const pressedThumbCenterOffsetRef = ref<number | null>(null)
const pressedThumbIndexRef = ref(-1)
const pressedValuesRef = ref<readonly number[] | null>(null)
const lastChangedValueRef = ref<number | readonly number[] | null>(null)
const lastChangeReasonRef = ref<SliderRootChangeEventReason>(REASONS.none)
const formatOptionsRef = computed(() => props.format)

const active = ref(-1)
const lastUsedThumbIndex = ref(-1)
const dragging = ref(false)
const thumbMap = shallowRef<Map<Element, CompositeMetadata<ThumbMetadata> | null>>(new Map())
const indicatorPosition = ref<(number | undefined)[]>([undefined, undefined])

function setActive(value: number) {
  active.value = value
  if (value !== -1) {
    lastUsedThumbIndex.value = value
  }
}

function registerFieldControlRef(element: HTMLElement | null) {
  if (element) {
    controlRef.value = element
  }
}

function setThumbMap(nextMap: Map<Element, CompositeMetadata<ThumbMetadata> | null>) {
  thumbMap.value = nextMap
}

const compositeListProps = {
  elementsRef: thumbRefs,
  onMapChange: setThumbMap,
}

const range = computed(() => Array.isArray(valueUnwrapped.value))
const values = computed<readonly number[]>(() => {
  if (!range.value) {
    return [clamp(valueUnwrapped.value as number, props.min, props.max)]
  }

  return [...(valueUnwrapped.value as readonly number[])].sort(asc)
})

useField({
  id: idRef,
  commit: (value: unknown) => validation.commit(value),
  value: computed(() => valueUnwrapped.value),
  controlRef,
  name,
  getValue: () => valueUnwrapped.value,
})

watch(
  () => valueUnwrapped.value,
  () => {
    clearErrors(name.value)

    if (shouldValidateOnChange()) {
      validation.commit(valueUnwrapped.value)
    }
    else {
      validation.commit(valueUnwrapped.value, true)
    }

    const initialValue = validityData.value.initialValue as number | readonly number[] | undefined
    let isDirty: boolean
    if (Array.isArray(valueUnwrapped.value) && Array.isArray(initialValue)) {
      isDirty = !areArraysEqual(valueUnwrapped.value, initialValue)
    }
    else {
      isDirty = valueUnwrapped.value !== initialValue
    }
    setDirty(isDirty)
  },
)

function areValuesEqual(
  newValue: number | readonly number[],
  oldValue: number | readonly number[],
) {
  if (typeof newValue === 'number' && typeof oldValue === 'number') {
    return newValue === oldValue
  }
  if (Array.isArray(newValue) && Array.isArray(oldValue)) {
    return areArraysEqual(newValue, oldValue)
  }
  return false
}

function setValue(
  newValue: number | number[],
  details?: SliderRootChangeEventDetails,
) {
  if (Number.isNaN(newValue) || areValuesEqual(newValue, valueUnwrapped.value)) {
    return
  }

  const changeDetails
    = details
      ?? createChangeEventDetails(REASONS.none, undefined, undefined, { activeThumbIndex: -1 })

  lastChangeReasonRef.value = changeDetails.reason

  const nativeEvent = changeDetails.event
  const EventConstructor = (nativeEvent.constructor as typeof Event | undefined) ?? Event
  const clonedEvent = new EventConstructor(nativeEvent.type, nativeEvent as EventInit)
  Object.defineProperty(clonedEvent, 'target', {
    writable: true,
    value: { value: newValue, name: name.value },
  })

  changeDetails.event = clonedEvent as typeof changeDetails.event
  lastChangedValueRef.value = newValue
  emit('valueChange', newValue, changeDetails)

  if (changeDetails.isCanceled) {
    return
  }

  setValueUnwrapped(newValue)
}

function getSliderChangeEventReason(event: KeyboardEvent | Event): SliderRootChangeEventReason {
  return event instanceof KeyboardEvent ? REASONS.keyboard : REASONS.inputChange
}

function handleInputChange(valueInput: number, index: number, event: KeyboardEvent | Event) {
  const newValue = getSliderValue(
    valueInput,
    index,
    props.min,
    props.max,
    range.value,
    values.value,
  )

  if (validateMinimumDistance(newValue, props.step, props.minStepsBetweenValues)) {
    const reason = getSliderChangeEventReason(event)
    setValue(
      newValue,
      createChangeEventDetails(reason, event, undefined, {
        activeThumbIndex: index,
      }),
    )
    setTouched(true)

    const nextValue = lastChangedValueRef.value ?? newValue
    emit('valueCommitted', nextValue, createGenericEventDetails(reason, event))
  }
}

if (process.env.NODE_ENV !== 'production' && props.min >= props.max) {
  warn('Slider `max` must be greater than `min`.')
}

watch(
  () => disabled.value,
  (nextDisabled) => {
    const activeEl = sliderRef.value ? activeElement(ownerDocument(sliderRef.value)!) : null
    if (nextDisabled && activeEl instanceof HTMLElement && contains(sliderRef.value, activeEl)) {
      activeEl.blur()
    }

    if (nextDisabled && active.value !== -1) {
      setActive(-1)
    }
  },
)

const state = computed<SliderRootState>(() => ({
  ...fieldState.value,
  activeThumbIndex: active.value,
  disabled: disabled.value,
  dragging: dragging.value,
  orientation: props.orientation,
  max: props.max,
  min: props.min,
  minStepsBetweenValues: props.minStepsBetweenValues,
  step: props.step,
  values: values.value,
}))

provide(sliderRootContextKey, {
  active,
  lastUsedThumbIndex,
  controlRef,
  dragging,
  disabled,
  validation,
  formatOptionsRef,
  handleInputChange,
  indicatorPosition,
  inset: computed(() => props.thumbAlignment !== 'center'),
  labelId: computed(() => ariaLabelledBy.value),
  rootLabelId: defaultLabelId,
  largeStep: computed(() => props.largeStep),
  lastChangedValueRef,
  lastChangeReasonRef,
  locale: computed(() => props.locale),
  max: computed(() => props.max),
  min: computed(() => props.min),
  minStepsBetweenValues: computed(() => props.minStepsBetweenValues),
  form: computed(() => props.form),
  name,
  onValueCommitted(value, details) {
    emit('valueCommitted', value, details)
  },
  orientation: computed(() => props.orientation),
  pressedInputRef,
  pressedThumbCenterOffsetRef,
  pressedThumbIndexRef,
  pressedValuesRef,
  registerFieldControlRef,
  renderBeforeHydration: computed(() => props.thumbAlignment === 'edge'),
  setActive,
  setDragging(value: boolean) {
    dragging.value = value
  },
  setIndicatorPosition(updater) {
    indicatorPosition.value = updater(indicatorPosition.value)
  },
  setLabelId(value) {
    localLabelId.value = value
  },
  setValue,
  state,
  step: computed(() => props.step),
  thumbCollisionBehavior: computed(() => props.thumbCollisionBehavior),
  thumbMap: thumbMap as ShallowRef<Map<Element, CompositeMetadata<ThumbMetadata> | null>>,
  thumbRefs,
  values,
})

const rootProps = computed(() => mergeProps(
  attrsObject,
  validation.getValidationProps(),
  {
    'aria-labelledby': ariaLabelledBy.value,
    'id': id,
    'role': 'group',
  },
))

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  ref: useMergedRefs(sliderRef),
  props: rootProps,
  defaultTagName: 'div',
  stateAttributesMapping: sliderStateAttributesMapping,
})
</script>

<template>
  <CompositeList v-bind="compositeListProps">
    <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
    <component
      :is="tag"
      v-else
      :ref="renderRef"
      v-bind="mergedProps"
    >
      <slot />
    </component>
  </CompositeList>
</template>
