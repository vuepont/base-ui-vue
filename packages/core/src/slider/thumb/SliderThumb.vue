<script setup lang="ts">
import type { ComponentPublicInstance, CSSProperties, Ref } from 'vue'
import type { LabelableContext } from '../../labelable-provider/LabelableContext'
import type { BaseUIComponentProps } from '../../utils/types'
import type { SliderRootState } from '../root/SliderRoot.vue'
import { computed, onMounted, ref, useAttrs, watch, watchEffect } from 'vue'
import {
  ARROW_DOWN,
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  COMPOSITE_KEYS,
  END,
  HOME,
  PAGE_DOWN,
  PAGE_UP,
} from '../../composite/composite'
import { useCompositeListItem } from '../../composite/list/useCompositeListItem'
import { useCSPContext } from '../../csp-provider/CSPContext'
import { useDirection } from '../../direction-provider'
import { useFieldRootContext } from '../../field/root/FieldRootContext'
import { matchesFocusVisible } from '../../floating-ui-vue/utils'
import { useLabelableId } from '../../labelable-provider/useLabelableId'
import { mergeProps } from '../../merge-props/mergeProps'
import { createGenericEventDetails } from '../../utils/createBaseUIEventDetails'
import { formatNumber } from '../../utils/formatNumber'
import { REASONS } from '../../utils/reasons'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { useRenderElement } from '../../utils/useRenderElement'
import { valueToPercent } from '../../utils/valueToPercent'
import { visuallyHidden } from '../../utils/visuallyHidden'
import { useSliderRootContext } from '../root/SliderRootContext'
import { sliderStateAttributesMapping } from '../root/stateAttributesMapping'
import { getMidpoint } from '../utils/getMidpoint'
import { getSliderValue } from '../utils/getSliderValue'
import { roundValueToStep } from '../utils/roundValueToStep'
import { script as prehydrationScript } from './prehydrationScript.min'
import { SliderThumbDataAttributes } from './SliderThumbDataAttributes'

/**
 * The draggable part of the slider at the tip of the indicator.
 * Renders a `<div>` element and a nested `<input type="range">`.
 *
 * Documentation: [Base UI Vue Slider](https://baseui-vue.com/docs/components/slider)
 */
defineOptions({
  name: 'SliderThumb',
  inheritAttrs: false,
})
const props = withDefaults(defineProps<SliderThumbProps>(), {
  as: 'div',
  disabled: false,
})
const ALL_KEYS = new Set([
  ARROW_UP,
  ARROW_DOWN,
  ARROW_LEFT,
  ARROW_RIGHT,
  HOME,
  END,
  PAGE_UP,
  PAGE_DOWN,
])

function getDefaultAriaValueText(
  values: readonly number[],
  index: number,
  format: Intl.NumberFormatOptions | undefined,
  locale: Intl.LocalesArgument | undefined,
): string | undefined {
  if (index < 0) {
    return undefined
  }

  if (values.length === 2) {
    if (index === 0) {
      return `${formatNumber(values[index], locale, format)} start range`
    }

    return `${formatNumber(values[index], locale, format)} end range`
  }

  return format ? formatNumber(values[index], locale, format) : undefined
}

function getNewValue(
  thumbValue: number,
  step: number,
  direction: 1 | -1,
  min: number,
  max: number,
): number {
  return direction === 1 ? Math.min(thumbValue + step, max) : Math.max(thumbValue - step, min)
}

export interface ThumbMetadata {
  inputId: LabelableContext['controlId']
}

export interface SliderThumbState extends SliderRootState {}
export interface SliderThumbProps extends Omit<BaseUIComponentProps<SliderThumbState>, 'style'> {
  /**
   * Whether the thumb should ignore user interaction.
   * @default false
   */
  disabled?: boolean
  /**
   * A function which returns a string value for the [`aria-label`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label) attribute of the `input`.
   */
  getAriaLabel?: ((index: number) => string) | null
  /**
   * A function which returns a string value for the [`aria-valuetext`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuetext) attribute of the `input`.
   * This is important for screen reader users.
   */
  getAriaValueText?: ((formattedValue: string, value: number, index: number) => string) | null
  /**
   * The index of the thumb which corresponds to the index of its value in the
   * `modelValue` or `defaultValue` array.
   * This prop is required to support server-side rendering for range sliders
   * with multiple thumbs.
   * @example
   * ```vue
   * <SliderRoot :default-value="[10, 20]">
   *   <SliderThumb :index="0" />
   *   <SliderThumb :index="1" />
   * </SliderRoot>
   * ```
   */
  index?: number
  /**
   * A ref to access the nested input element.
   */
  inputRef?: ((el: HTMLInputElement | null) => void) | Ref<HTMLInputElement | null> | null
  /**
   * Optional tab index attribute forwarded to the `input`.
   */
  tabIndex?: number
  id?: string
  ariaLabel?: string
  ariaLabelledby?: string
  ariaDescribedby?: string
  style?: CSSProperties | ((state: SliderThumbState) => CSSProperties)
}

const attrs = useAttrs()
const { nonce } = useCSPContext()
const direction = useDirection()
const rootContext = useSliderRootContext()
const { setTouched, setFocused, validationMode, validation } = useFieldRootContext()

const id = useBaseUiId(props.id)
const disabled = computed(() => props.disabled || rootContext.disabled.value)
const range = computed(() => rootContext.values.value.length > 1)
const vertical = computed(() => rootContext.orientation.value === 'vertical')
const rtl = computed(() => direction.value === 'rtl')

const thumbRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const restoringFocusVisibleRef = ref(false)

const defaultInputId = useBaseUiId()
const labelableId = useLabelableId()
const inputId = computed(() => (range.value ? defaultInputId : labelableId.value))

const { ref: listItemRef, index: compositeIndex } = useCompositeListItem<ThumbMetadata>({
  metadata: () => ({
    inputId,
  }),
  index: () => props.index,
})

const index = computed(() => (!range.value ? 0 : (props.index ?? compositeIndex.value)))
const last = computed(() => index.value === rootContext.values.value.length - 1)
const thumbValue = computed(() => rootContext.values.value[index.value])
const thumbValuePercent = computed(() => valueToPercent(thumbValue.value, rootContext.min.value, rootContext.max.value))

const isMounted = ref(false)
const positionPercent = ref<number | undefined>(undefined)

onMounted(() => {
  isMounted.value = true
})

const safeLastUsedThumbIndex = computed(() =>
  rootContext.lastUsedThumbIndex.value >= 0 && rootContext.lastUsedThumbIndex.value < rootContext.values.value.length
    ? rootContext.lastUsedThumbIndex.value
    : -1)

function setIndicatorPositionForIndex(nextInsetPosition: number | undefined) {
  rootContext.setIndicatorPosition((prevPosition) => {
    const next = [...prevPosition]
    if (index.value === 0) {
      next[0] = nextInsetPosition
    }
    else if (last.value) {
      next[1] = nextInsetPosition
    }
    return next
  })
}

function getInsetPosition() {
  const control = rootContext.controlRef.value
  const thumb = thumbRef.value
  if (!control || !thumb) {
    return
  }

  const thumbRect = thumb.getBoundingClientRect()
  const controlRect = control.getBoundingClientRect()
  const side = vertical.value ? 'height' : 'width'
  const controlSize = controlRect[side] - thumbRect[side]
  const thumbOffsetFromControlEdge = thumbRect[side] / 2 + (controlSize * thumbValuePercent.value) / 100
  const nextPositionPercent = (thumbOffsetFromControlEdge / controlRect[side]) * 100
  const nextInsetPosition = Number.isFinite(nextPositionPercent) ? nextPositionPercent : undefined

  positionPercent.value = nextInsetPosition
  setIndicatorPositionForIndex(nextInsetPosition)
}

watch(
  () => [rootContext.inset.value, thumbValuePercent.value, isMounted.value],
  () => {
    if (rootContext.inset.value) {
      queueMicrotask(getInsetPosition)
    }
  },
  { immediate: true },
)

watchEffect((onCleanup) => {
  if (!rootContext.inset.value || typeof ResizeObserver !== 'function') {
    return
  }

  const control = rootContext.controlRef.value
  const thumb = thumbRef.value
  if (!control || !thumb) {
    return
  }

  const observer = new ResizeObserver(getInsetPosition)
  observer.observe(control)
  observer.observe(thumb)

  onCleanup(() => {
    observer.disconnect()
  })
})

const thumbStyle = computed(() => {
  const startEdge = vertical.value ? 'bottom' : 'insetInlineStart'
  const crossOffsetProperty = vertical.value ? 'left' : 'top'

  let zIndex: number | undefined
  if (range.value) {
    if (rootContext.active.value === index.value) {
      zIndex = 2
    }
    else if (safeLastUsedThumbIndex.value === index.value) {
      zIndex = 1
    }
  }
  else if (rootContext.active.value === index.value) {
    zIndex = 1
  }

  if (!rootContext.inset.value) {
    if (!Number.isFinite(thumbValuePercent.value)) {
      return visuallyHidden
    }

    return {
      position: 'absolute',
      [startEdge]: `${thumbValuePercent.value}%`,
      [crossOffsetProperty]: '50%',
      translate: `${(vertical.value || !rtl.value ? -1 : 1) * 50}% ${(vertical.value ? 1 : -1) * 50}%`,
      zIndex,
    } satisfies CSSProperties
  }

  return {
    '--position': `${positionPercent.value ?? 0}%`,
    'visibility':
      (rootContext.renderBeforeHydration.value && !isMounted.value) || positionPercent.value === undefined
        ? 'hidden'
        : undefined,
    'position': 'absolute',
    [startEdge]: 'var(--position)',
    [crossOffsetProperty]: '50%',
    'translate': `${(vertical.value || !rtl.value ? -1 : 1) * 50}% ${(vertical.value ? 1 : -1) * 50}%`,
    zIndex,
  } satisfies CSSProperties & Record<string, unknown>
})

const cssWritingMode = computed<CSSProperties['writingMode'] | undefined>(() => {
  if (rootContext.orientation.value === 'vertical') {
    return rtl.value ? 'vertical-rl' : 'vertical-lr'
  }

  return undefined
})

const ariaLabel = computed(() =>
  typeof props.getAriaLabel === 'function' ? props.getAriaLabel(index.value) : props.ariaLabel)

function setInputRef(node: HTMLInputElement | null) {
  inputRef.value = node
  validation.setInputRef(node)

  const forwardedInputRef = props.inputRef

  if (!forwardedInputRef) {
    return
  }

  if (typeof forwardedInputRef === 'function') {
    forwardedInputRef(node)
  }
  else {
    forwardedInputRef.value = node
  }
}

function setInputVNodeRef(node: Element | ComponentPublicInstance | null) {
  setInputRef(node instanceof HTMLInputElement ? node : null)
}

function handleBlur(event: FocusEvent) {
  if (restoringFocusVisibleRef.value) {
    event.stopPropagation()
    return
  }

  if (!thumbRef.value) {
    return
  }

  rootContext.setActive(-1)
  setTouched(true)
  setFocused(false)

  if (validationMode.value === 'onBlur') {
    validation.commit(getSliderValue(
      thumbValue.value,
      index.value,
      rootContext.min.value,
      rootContext.max.value,
      range.value,
      rootContext.values.value,
    ))
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (!ALL_KEYS.has(event.key)) {
    return
  }

  if (COMPOSITE_KEYS.has(event.key)) {
    event.stopPropagation()
  }

  let newValue: number | null = null
  const roundedValue = roundValueToStep(thumbValue.value, rootContext.step.value, rootContext.min.value)
  switch (event.key) {
    case ARROW_UP:
      newValue = getNewValue(roundedValue, event.shiftKey ? rootContext.largeStep.value : rootContext.step.value, 1, rootContext.min.value, rootContext.max.value)
      break
    case ARROW_RIGHT:
      newValue = getNewValue(
        roundedValue,
        event.shiftKey ? rootContext.largeStep.value : rootContext.step.value,
        rtl.value ? -1 : 1,
        rootContext.min.value,
        rootContext.max.value,
      )
      break
    case ARROW_DOWN:
      newValue = getNewValue(roundedValue, event.shiftKey ? rootContext.largeStep.value : rootContext.step.value, -1, rootContext.min.value, rootContext.max.value)
      break
    case ARROW_LEFT:
      newValue = getNewValue(
        roundedValue,
        event.shiftKey ? rootContext.largeStep.value : rootContext.step.value,
        rtl.value ? 1 : -1,
        rootContext.min.value,
        rootContext.max.value,
      )
      break
    case PAGE_UP:
      newValue = getNewValue(roundedValue, rootContext.largeStep.value, 1, rootContext.min.value, rootContext.max.value)
      break
    case PAGE_DOWN:
      newValue = getNewValue(roundedValue, rootContext.largeStep.value, -1, rootContext.min.value, rootContext.max.value)
      break
    case END:
      newValue = rootContext.max.value
      if (range.value) {
        newValue = Number.isFinite(rootContext.values.value[index.value + 1])
          ? rootContext.values.value[index.value + 1] - rootContext.step.value * rootContext.minStepsBetweenValues.value
          : rootContext.max.value
      }
      break
    case HOME:
      newValue = rootContext.min.value
      if (range.value) {
        newValue = Number.isFinite(rootContext.values.value[index.value - 1])
          ? rootContext.values.value[index.value - 1] + rootContext.step.value * rootContext.minStepsBetweenValues.value
          : rootContext.min.value
      }
      break
    default:
      break
  }

  if (newValue !== null) {
    const input = event.currentTarget as HTMLInputElement
    if (!matchesFocusVisible(input)) {
      restoringFocusVisibleRef.value = true
      input.blur()
      ;(input as HTMLInputElement & { focusVisible?: boolean }).focus({
        preventScroll: true,
        focusVisible: true,
      } as FocusOptions)
    }

    rootContext.handleInputChange(newValue, index.value, event)
    rootContext.onValueCommitted(
      rootContext.lastChangedValueRef.value ?? getSliderValue(
        newValue,
        index.value,
        rootContext.min.value,
        rootContext.max.value,
        range.value,
        rootContext.values.value,
      ),
      createGenericEventDetails(REASONS.keyboard, event),
    )
    event.preventDefault()
  }
}

const inputStyle = computed(() => ({
  ...visuallyHidden,
  width: '100%',
  height: '100%',
  writingMode: cssWritingMode.value,
}))

const inputValidationProps = computed(() => validation.getInputValidationProps())
const forwardedInputAttrs = computed(() => {
  const attrsObject = attrs as Record<string, unknown>

  return {
    onBlur: attrsObject.onBlur,
    onFocus: attrsObject.onFocus,
    onKeydown: attrsObject.onKeydown,
  }
})

const thumbAttrs = computed(() => {
  const {
    onBlur: _onBlur,
    onFocus: _onFocus,
    onKeydown: _onKeydown,
    ...rest
  } = attrs as Record<string, unknown>

  return rest
})

const inputProps = computed(() => mergeProps(
  inputValidationProps.value,
  forwardedInputAttrs.value,
  {
    'aria-label': ariaLabel.value,
    'aria-labelledby': props.ariaLabelledby ?? (ariaLabel.value == null ? rootContext.labelId.value : undefined),
    'aria-describedby': props.ariaDescribedby ?? inputValidationProps.value['aria-describedby'],
    'aria-orientation': rootContext.orientation.value,
    'aria-valuenow': thumbValue.value,
    'aria-valuetext':
      typeof props.getAriaValueText === 'function'
        ? props.getAriaValueText(
            formatNumber(
              thumbValue.value,
              rootContext.locale.value,
              rootContext.formatOptionsRef.value,
            ),
            thumbValue.value,
            index.value,
          )
        : getDefaultAriaValueText(
            rootContext.values.value,
            index.value,
            rootContext.formatOptionsRef.value,
            rootContext.locale.value,
          ),
    'disabled': disabled.value,
    'form': rootContext.form.value,
    'id': inputId.value,
    'max': rootContext.max.value,
    'min': rootContext.min.value,
    'name': rootContext.name.value,
    onChange(event: Event) {
      rootContext.handleInputChange((event.currentTarget as HTMLInputElement).valueAsNumber, index.value, event)
    },
    onFocus(event: FocusEvent) {
      const isRestoringFocusVisible = restoringFocusVisibleRef.value
      restoringFocusVisibleRef.value = false
      rootContext.setActive(index.value)
      setFocused(true)

      if (isRestoringFocusVisible) {
        event.stopPropagation()
      }
    },
    'onBlur': handleBlur,
    'onKeydown': handleKeydown,
    'step': rootContext.step.value,
    'style': inputStyle.value,
    'tabIndex': props.tabIndex ?? undefined,
    'type': 'range',
    'value': thumbValue.value ?? '',
  },
))

const mergedRef = useMergedRefs(listItemRef, thumbRef)
const thumbProps = computed(() => mergeProps(
  thumbAttrs.value,
  {
    [SliderThumbDataAttributes.index]: index.value,
    id,
    onPointerdown(event: PointerEvent) {
      rootContext.pressedThumbIndexRef.value = index.value

      if (thumbRef.value != null) {
        const axis = rootContext.orientation.value === 'horizontal' ? 'x' : 'y'
        const midpoint = getMidpoint(thumbRef.value)
        const offset = (rootContext.orientation.value === 'horizontal' ? event.clientX : event.clientY) - midpoint[axis]
        rootContext.pressedThumbCenterOffsetRef.value = offset
      }

      if (inputRef.value != null && rootContext.pressedInputRef.value !== inputRef.value) {
        rootContext.pressedInputRef.value = inputRef.value
      }
    },
    style: thumbStyle.value,
    suppressHydrationWarning: rootContext.renderBeforeHydration.value || undefined,
  },
))

const { tag, mergedProps, renderless, ref: renderRef } = useRenderElement({
  componentProps: props,
  state: rootContext.state,
  props: thumbProps,
  defaultTagName: 'div',
  ref: mergedRef,
  stateAttributesMapping: sliderStateAttributesMapping,
})

watch(
  () => rootContext.active.value,
  () => {
    if (disabled.value && rootContext.active.value === index.value) {
      rootContext.setActive(-1)
    }
  },
)
</script>

<template>
  <slot
    v-if="renderless"
    :ref="renderRef"
    :props="mergedProps"
    :state="rootContext.state"
  />
  <component
    :is="tag"
    v-else
    :ref="renderRef"
    v-bind="mergedProps"
  >
    <slot />
    <input
      :ref="setInputVNodeRef"
      v-bind="inputProps"
    >
    <!-- eslint-disable-next-line vue/require-component-is -->
    <component
      is="script"
      v-if="rootContext.inset.value && !isMounted && rootContext.renderBeforeHydration.value && last"
      :nonce="nonce"
      :suppress-hydration-warning="true"
    >
      {{ prehydrationScript }}
    </component>
  </component>
</template>
