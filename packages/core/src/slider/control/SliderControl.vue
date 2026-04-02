<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { Coords } from '../../floating-ui-vue/types'
import type { BaseUIComponentProps } from '../../utils/types'
import type { SliderRootState } from '../root/SliderRoot.vue'
import { isElement } from '@floating-ui/utils/dom'
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watchEffect } from 'vue'
import { useDirection } from '../../direction-provider'
import { activeElement, contains, getTarget } from '../../floating-ui-vue/utils'
import { mergeProps } from '../../merge-props/mergeProps'
import { clamp } from '../../utils/clamp'
import { createChangeEventDetails, createGenericEventDetails } from '../../utils/createBaseUIEventDetails'
import { ownerDocument } from '../../utils/owner'
import { REASONS } from '../../utils/reasons'
import { useAnimationFrame } from '../../utils/useAnimationFrame'
import { useRenderElement } from '../../utils/useRenderElement'
import { useSliderRootContext } from '../root/SliderRootContext'
import { sliderStateAttributesMapping } from '../root/stateAttributesMapping'
import { getMidpoint } from '../utils/getMidpoint'
import { resolveThumbCollision } from '../utils/resolveThumbCollision'
import { roundValueToStep } from '../utils/roundValueToStep'
import { validateMinimumDistance } from '../utils/validateMinimumDistance'

/**
 * The clickable, interactive part of the slider.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Slider](https://baseui-vue.com/docs/components/slider)
 */
defineOptions({
  name: 'SliderControl',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SliderControlProps>(), {
  as: 'div',
})

const INTENTIONAL_DRAG_COUNT_THRESHOLD = 2

function getControlOffset(styles: CSSStyleDeclaration | null, vertical: boolean) {
  if (!styles) {
    return { start: 0, end: 0 }
  }

  function parseSize(value: string | null | undefined) {
    const parsed = value != null ? Number.parseFloat(value) : 0
    return Number.isNaN(parsed) ? 0 : parsed
  }

  const start = !vertical ? 'InlineStart' : 'Top'
  const end = !vertical ? 'InlineEnd' : 'Bottom'

  return {
    start: parseSize(styles[`border${start}Width` as keyof CSSStyleDeclaration] as string)
      + parseSize(styles[`padding${start}` as keyof CSSStyleDeclaration] as string),
    end: parseSize(styles[`border${end}Width` as keyof CSSStyleDeclaration] as string)
      + parseSize(styles[`padding${end}` as keyof CSSStyleDeclaration] as string),
  }
}

function getFingerCoords(
  event: TouchEvent | PointerEvent,
  touchIdRef: { value: number | null },
): Coords | null {
  if (touchIdRef.value != null && 'changedTouches' in event) {
    for (let i = 0; i < event.changedTouches.length; i += 1) {
      const touch = event.changedTouches[i]
      if (touch.identifier === touchIdRef.value) {
        return { x: touch.clientX, y: touch.clientY }
      }
    }

    return null
  }

  return {
    x: (event as PointerEvent).clientX,
    y: (event as PointerEvent).clientY,
  }
}

interface FingerState {
  value: number | number[]
  thumbIndex: number
  didSwap: boolean
}

export interface SliderControlState extends SliderRootState {}
export interface SliderControlProps extends BaseUIComponentProps<SliderControlState> {}

const attrs = useAttrs()
const rootContext = useSliderRootContext()
const direction = useDirection()
const focusFrame = useAnimationFrame()

const range = computed(() => rootContext.values.value.length > 1)
const vertical = computed(() => rootContext.orientation.value === 'vertical')

const controlRef = ref<HTMLElement | null>(null)
const stylesRef = ref<CSSStyleDeclaration | null>(null)
function setStylesRef(element: HTMLElement | null) {
  if (element && stylesRef.value == null) {
    stylesRef.value = getComputedStyle(element)
  }
}

const touchIdRef = ref<number | null>(null)
const moveCountRef = ref(0)
const insetThumbOffsetRef = ref(0)
const latestValuesRef = ref(rootContext.values.value)

function updatePressedThumb(nextIndex: number) {
  if (rootContext.pressedThumbIndexRef.value !== nextIndex) {
    rootContext.pressedThumbIndexRef.value = nextIndex
  }

  const thumbElement = rootContext.thumbRefs.value[nextIndex]
  if (!thumbElement) {
    rootContext.pressedThumbCenterOffsetRef.value = null
    rootContext.pressedInputRef.value = null
    return
  }

  rootContext.pressedInputRef.value = thumbElement.querySelector<HTMLInputElement>('input[type="range"]')
}

function getFingerState(fingerCoords: Coords): FingerState | null {
  const control = controlRef.value
  if (!control) {
    return null
  }

  const { width, height, bottom, left, right } = control.getBoundingClientRect()
  const controlOffset = getControlOffset(stylesRef.value, vertical.value)
  const insetThumbOffset = insetThumbOffsetRef.value
  const controlSize
    = (vertical.value ? height : width)
      - controlOffset.start
      - controlOffset.end
      - insetThumbOffset * 2
  const thumbCenterOffset = rootContext.pressedThumbCenterOffsetRef.value ?? 0
  const fingerX = fingerCoords.x - thumbCenterOffset
  const fingerY = fingerCoords.y - thumbCenterOffset

  const valueSize = vertical.value
    ? bottom - fingerY - controlOffset.end
    : ((direction.value === 'rtl' ? right - fingerX : fingerX - left) - controlOffset.start)

  const valueRescaled = clamp((valueSize - insetThumbOffset) / controlSize, 0, 1)

  let newValue = (rootContext.max.value - rootContext.min.value) * valueRescaled + rootContext.min.value
  newValue = roundValueToStep(newValue, rootContext.step.value, rootContext.min.value)
  newValue = clamp(newValue, rootContext.min.value, rootContext.max.value)

  if (!range.value) {
    return {
      value: newValue,
      thumbIndex: 0,
      didSwap: false,
    }
  }

  const thumbIndex = rootContext.pressedThumbIndexRef.value
  if (thumbIndex < 0) {
    return null
  }

  const collisionResult = resolveThumbCollision({
    behavior: rootContext.thumbCollisionBehavior.value,
    values: rootContext.values.value,
    currentValues: latestValuesRef.value ?? rootContext.values.value,
    initialValues: rootContext.pressedValuesRef.value,
    pressedIndex: thumbIndex,
    nextValue: newValue,
    min: rootContext.min.value,
    max: rootContext.max.value,
    step: rootContext.step.value,
    minStepsBetweenValues: rootContext.minStepsBetweenValues.value,
  })

  if (rootContext.thumbCollisionBehavior.value === 'swap' && collisionResult.didSwap) {
    updatePressedThumb(collisionResult.thumbIndex)
  }
  else {
    rootContext.pressedThumbIndexRef.value = collisionResult.thumbIndex
  }

  return collisionResult
}

function startPressing(fingerCoords: Coords) {
  rootContext.pressedValuesRef.value = range.value ? rootContext.values.value.slice() : null
  latestValuesRef.value = rootContext.values.value

  const pressedThumbIndex = rootContext.pressedThumbIndexRef.value
  let closestThumbIndex = pressedThumbIndex

  if (pressedThumbIndex > -1 && pressedThumbIndex < rootContext.values.value.length) {
    if (rootContext.values.value[pressedThumbIndex] === rootContext.max.value) {
      let candidateIndex = pressedThumbIndex

      while (candidateIndex > 0 && rootContext.values.value[candidateIndex - 1] === rootContext.max.value) {
        candidateIndex -= 1
      }

      closestThumbIndex = candidateIndex
    }
  }
  else {
    const axis = !vertical.value ? 'x' : 'y'
    let minDistance: number | undefined

    closestThumbIndex = -1

    for (let i = 0; i < rootContext.thumbRefs.value.length; i += 1) {
      const thumbEl = rootContext.thumbRefs.value[i]
      if (isElement(thumbEl)) {
        const midpoint = getMidpoint(thumbEl)
        const distance = Math.abs(fingerCoords[axis] - midpoint[axis])

        if (minDistance === undefined || distance <= minDistance) {
          closestThumbIndex = i
          minDistance = distance
        }
      }
    }
  }

  if (closestThumbIndex > -1 && closestThumbIndex !== pressedThumbIndex) {
    updatePressedThumb(closestThumbIndex)
  }

  if (rootContext.inset.value) {
    const thumbEl = rootContext.thumbRefs.value[closestThumbIndex]
    if (isElement(thumbEl)) {
      const thumbRect = thumbEl.getBoundingClientRect()
      insetThumbOffsetRef.value = thumbRect[vertical.value ? 'height' : 'width'] / 2
    }
  }
}

function focusThumb(thumbIndex: number) {
  const input = rootContext.thumbRefs.value?.[thumbIndex]?.querySelector<HTMLInputElement>('input[type="range"]')
  if (!input) {
    return
  }

  input.focus({ preventScroll: true })
}

function stopListening() {
  const doc = ownerDocument(controlRef.value)
  if (!doc) {
    return
  }
  doc.removeEventListener('pointermove', handleTouchMove)
  doc.removeEventListener('pointerup', handleTouchEnd)
  doc.removeEventListener('touchmove', handleTouchMove)
  doc.removeEventListener('touchend', handleTouchEnd)
  rootContext.pressedValuesRef.value = null
}

function handleTouchMove(nativeEvent: TouchEvent | PointerEvent) {
  const fingerCoords = getFingerCoords(nativeEvent, touchIdRef)
  if (fingerCoords == null) {
    return
  }

  moveCountRef.value += 1

  if (nativeEvent.type === 'pointermove' && (nativeEvent as PointerEvent).buttons === 0) {
    handleTouchEnd(nativeEvent)
    return
  }

  const finger = getFingerState(fingerCoords)
  if (finger == null) {
    return
  }

  if (validateMinimumDistance(finger.value, rootContext.step.value, rootContext.minStepsBetweenValues.value)) {
    if (!rootContext.dragging.value && moveCountRef.value > INTENTIONAL_DRAG_COUNT_THRESHOLD) {
      rootContext.setDragging(true)
    }

    rootContext.setValue(
      finger.value,
      createChangeEventDetails(REASONS.drag, nativeEvent, undefined, {
        activeThumbIndex: finger.thumbIndex,
      }),
    )

    latestValuesRef.value = Array.isArray(finger.value) ? finger.value : [finger.value]

    if (finger.didSwap) {
      focusThumb(finger.thumbIndex)
    }
  }
}

function handleTouchEnd(nativeEvent: TouchEvent | PointerEvent) {
  rootContext.setActive(-1)
  rootContext.setDragging(false)
  rootContext.pressedInputRef.value = null
  rootContext.pressedThumbCenterOffsetRef.value = null

  const fingerCoords = getFingerCoords(nativeEvent, touchIdRef)
  const finger = fingerCoords != null ? getFingerState(fingerCoords) : null

  if (finger != null) {
    const commitReason = rootContext.lastChangeReasonRef.value
    rootContext.onValueCommitted(
      rootContext.lastChangedValueRef.value ?? finger.value,
      createGenericEventDetails(commitReason, nativeEvent),
    )
  }

  if (
    'pointerId' in nativeEvent
    && typeof controlRef.value?.hasPointerCapture === 'function'
    && controlRef.value.hasPointerCapture(nativeEvent.pointerId)
    && typeof controlRef.value.releasePointerCapture === 'function'
  ) {
    controlRef.value.releasePointerCapture(nativeEvent.pointerId)
  }

  rootContext.pressedThumbIndexRef.value = -1
  touchIdRef.value = null
  rootContext.pressedValuesRef.value = null
  stopListening()
}

function handleTouchStart(nativeEvent: TouchEvent) {
  if (rootContext.disabled.value) {
    return
  }

  const touch = nativeEvent.changedTouches[0]
  if (touch != null) {
    touchIdRef.value = touch.identifier
  }

  const fingerCoords = getFingerCoords(nativeEvent, touchIdRef)
  if (fingerCoords != null) {
    startPressing(fingerCoords)

    const finger = getFingerState(fingerCoords)
    if (finger == null) {
      return
    }

    focusThumb(finger.thumbIndex)
    rootContext.setValue(
      finger.value,
      createChangeEventDetails(REASONS.trackPress, nativeEvent, undefined, {
        activeThumbIndex: finger.thumbIndex,
      }),
    )

    latestValuesRef.value = Array.isArray(finger.value) ? finger.value : [finger.value]

    if (finger.didSwap) {
      focusThumb(finger.thumbIndex)
    }
  }

  moveCountRef.value = 0
  const doc = ownerDocument(controlRef.value)
  if (!doc) {
    return
  }
  doc.addEventListener('touchmove', handleTouchMove, { passive: true })
  doc.addEventListener('touchend', handleTouchEnd, { passive: true })
}

onMounted(() => {
  const control = controlRef.value
  if (!control) {
    return
  }

  control.addEventListener('touchstart', handleTouchStart, { passive: true })
})

onBeforeUnmount(() => {
  controlRef.value?.removeEventListener('touchstart', handleTouchStart)
  focusFrame.cancel()
  stopListening()
})

function mergedRef(node: Element | ComponentPublicInstance | null) {
  const element = node instanceof HTMLElement ? node : null
  controlRef.value = element
  rootContext.registerFieldControlRef(element)
  setStylesRef(element)
}

watchEffect(() => {
  if (rootContext.disabled.value) {
    stopListening()
  }
})

const controlProps = computed(() => mergeProps(
  attrs as Record<string, unknown>,
  {
    'data-base-ui-slider-control': rootContext.renderBeforeHydration.value ? '' : undefined,
    onPointerdown(event: PointerEvent) {
      const control = controlRef.value
      const target = getTarget(event)

      if (
        !control
        || rootContext.disabled.value
        || event.defaultPrevented
        || !isElement(target)
        || event.button !== 0
      ) {
        return
      }

      const fingerCoords = getFingerCoords(event, touchIdRef)

      if (fingerCoords != null) {
        startPressing(fingerCoords)
        const finger = getFingerState(fingerCoords)

        if (finger == null) {
          return
        }

        const focusedElement = ownerDocument(control) ? activeElement(ownerDocument(control)!) : null
        const pressedOnFocusedThumb = contains(
          rootContext.thumbRefs.value[finger.thumbIndex],
          focusedElement as Element | null,
        )

        if (pressedOnFocusedThumb) {
          event.preventDefault()
        }
        else {
          focusFrame.request(() => {
            focusThumb(finger.thumbIndex)
          })
        }

        rootContext.setDragging(true)

        const pressedOnAnyThumb = rootContext.pressedThumbCenterOffsetRef.value != null
        if (!pressedOnAnyThumb) {
          rootContext.setValue(
            finger.value,
            createChangeEventDetails(REASONS.trackPress, event, undefined, {
              activeThumbIndex: finger.thumbIndex,
            }),
          )

          latestValuesRef.value = Array.isArray(finger.value) ? finger.value : [finger.value]

          if (finger.didSwap) {
            focusThumb(finger.thumbIndex)
          }
        }
      }

      if (event.pointerId && typeof control.setPointerCapture === 'function') {
        control.setPointerCapture(event.pointerId)
      }

      moveCountRef.value = 0
      const doc = ownerDocument(control)
      if (!doc) {
        return
      }
      doc.addEventListener('pointermove', handleTouchMove, { passive: true })
      doc.addEventListener('pointerup', handleTouchEnd, { once: true })
    },
  },
))

const { tag, mergedProps, renderless, ref: renderRef } = useRenderElement({
  componentProps: props,
  state: rootContext.state,
  props: controlProps,
  defaultTagName: 'div',
  ref: mergedRef,
  stateAttributesMapping: sliderStateAttributesMapping,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="rootContext.state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot />
  </component>
</template>
