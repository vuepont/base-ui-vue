import type { MaybeRefOrGetter } from 'vue'
import type { TextDirection } from '../direction-provider/DirectionContext'
import type { Dimensions } from '../floating-ui-vue/types'
import type { Side } from './useAnchorPositioning'
import { computed, nextTick, onBeforeUnmount, shallowRef, toValue, watch } from 'vue'
import { EMPTY_OBJECT } from './constants'
import { NOOP } from './empty'
import { getCssDimensions } from './getCssDimensions'
import { useAnimationFrame } from './useAnimationFrame'
import { useAnimationsFinished } from './useAnimationsFinished'

/**
 * Allows the popup to resize based on changed content while preserving CSS transitions.
 */
export function usePopupAutoResize(parameters: UsePopupAutoResizeParameters) {
  const popupElement = computed(() => toValue(parameters.popupElement) ?? null)
  const positionerElement = computed(() => toValue(parameters.positionerElement) ?? null)
  const mounted = computed(() => toValue(parameters.mounted))
  const content = computed(() => toValue(parameters.content))
  const side = computed(() => toValue(parameters.side) ?? 'top')
  const direction = computed(() => toValue(parameters.direction) ?? 'ltr')

  const runOnceAnimationsFinish = useAnimationsFinished(popupElement, true, false)
  const animationFrame = useAnimationFrame()
  const committedDimensions = shallowRef<Dimensions | null>(null)
  const isInitialRender = shallowRef(true)

  let restoreAnchoringStyles = NOOP

  const anchoringStyles = computed(() => getAnchoringStyles(side.value, direction.value))

  watch(
    [
      mounted,
      popupElement,
      positionerElement,
      content,
      anchoringStyles,
    ],
    ([isMounted, popup, positioner], _previous, onCleanup) => {
      if (!isMounted) {
        restoreAnchoringStyles()
        restoreAnchoringStyles = NOOP
        isInitialRender.value = true
        committedDimensions.value = null
        return
      }

      if (!popup || !positioner) {
        return
      }

      restoreAnchoringStyles = applyElementStyles(popup, anchoringStyles.value)

      setPopupCssSize(popup, 'auto')

      const restorePopupPosition = overrideElementStyle(popup, 'position', 'static')
      const restorePopupTransform = overrideElementStyle(popup, 'transform', 'none')
      const restorePopupScale = overrideElementStyle(popup, 'scale', '1')
      const restorePositionerAvailableSize = applyElementStyles(positioner, {
        '--available-width': 'max-content',
        '--available-height': 'max-content',
      })

      function restoreMeasurementOverrides() {
        restorePopupPosition()
        restorePopupTransform()
        restorePositionerAvailableSize()
      }

      function restoreMeasurementOverridesIncludingScale() {
        restoreMeasurementOverrides()
        restorePopupScale()
      }

      parameters.onMeasureLayout?.()

      if (isInitialRender.value || committedDimensions.value == null) {
        setPositionerCssSize(positioner, 'max-content')

        const dimensions = getCssDimensions(popup)

        committedDimensions.value = dimensions

        commitPositionerCssSize(positioner, dimensions)
        restoreMeasurementOverridesIncludingScale()
        parameters.onMeasureLayoutComplete?.(null, dimensions)

        isInitialRender.value = false

        onCleanup(() => {
          restoreAnchoringStyles()
          restoreAnchoringStyles = NOOP
        })

        return
      }

      setPositionerCssSize(positioner, 'max-content')

      const previousDimensions = committedDimensions.value
      const newDimensions = getCssDimensions(popup)

      committedDimensions.value = newDimensions

      setPopupCssSize(popup, previousDimensions)
      restoreMeasurementOverridesIncludingScale()
      parameters.onMeasureLayoutComplete?.(previousDimensions, newDimensions)

      commitPositionerCssSize(positioner, newDimensions)

      const abortController = new AbortController()

      animationFrame.request(() => {
        setPopupCssSize(popup, newDimensions)

        runOnceAnimationsFinish(() => {
          popup.style.setProperty('--popup-width', 'auto')
          popup.style.setProperty('--popup-height', 'auto')
        }, abortController.signal)
      })

      onCleanup(() => {
        abortController.abort()
        animationFrame.cancel()
        restoreAnchoringStyles()
        restoreAnchoringStyles = NOOP
      })
    },
    { flush: 'post', immediate: true },
  )

  onBeforeUnmount(() => {
    animationFrame.cancel()
    restoreAnchoringStyles()
    restoreAnchoringStyles = NOOP
  })
}

interface UsePopupAutoResizeParameters {
  /**
   * Element to resize.
   */
  popupElement: MaybeRefOrGetter<HTMLElement | null | undefined>
  /**
   * Positioner element, the parent of the popup.
   */
  positionerElement: MaybeRefOrGetter<HTMLElement | null | undefined>
  /**
   * Whether the popup is mounted.
   */
  mounted: MaybeRefOrGetter<boolean>
  /**
   * Content value that should trigger a resize.
   */
  content: MaybeRefOrGetter<unknown>
  /**
   * Callback fired before measuring the new layout.
   */
  onMeasureLayout?: (() => void) | undefined
  /**
   * Callback fired after the new dimensions have been measured.
   */
  onMeasureLayoutComplete?:
    | ((previousDimensions: Dimensions | null, newDimensions: Dimensions) => void)
    | undefined
  /**
   * Current logical side of the popup.
   */
  side: MaybeRefOrGetter<Side | undefined>
  /**
   * Current text direction.
   */
  direction: MaybeRefOrGetter<TextDirection>
}

function getAnchoringStyles(side: Side, direction: TextDirection): Record<string, string> {
  let isOriginSide = side === 'top'
  let isPhysicalLeft = side === 'left'

  if (direction === 'rtl') {
    isOriginSide = isOriginSide || side === 'inline-end'
    isPhysicalLeft = isPhysicalLeft || side === 'inline-end'
  }
  else {
    isOriginSide = isOriginSide || side === 'inline-start'
    isPhysicalLeft = isPhysicalLeft || side === 'inline-start'
  }

  if (!isOriginSide) {
    return EMPTY_OBJECT as Record<string, string>
  }

  return {
    position: 'absolute',
    [side === 'top' ? 'bottom' : 'top']: '0',
    [isPhysicalLeft ? 'right' : 'left']: '0',
  }
}

function overrideElementStyle(element: HTMLElement, property: string, value: string) {
  const originalValue = element.style.getPropertyValue(property)

  element.style.setProperty(property, value)

  return () => {
    if (originalValue) {
      element.style.setProperty(property, originalValue)
    }
    else {
      element.style.removeProperty(property)
    }
  }
}

function applyElementStyles(element: HTMLElement, styles: Record<string, string>) {
  const restorers: Array<() => void> = []

  for (const [key, value] of Object.entries(styles)) {
    restorers.push(overrideElementStyle(element, key, value))
  }

  return restorers.length
    ? () => {
        restorers.forEach(restore => restore())
      }
    : NOOP
}

function setPopupCssSize(popupElement: HTMLElement, size: Dimensions | 'auto') {
  const width = size === 'auto' ? 'auto' : `${size.width}px`
  const height = size === 'auto' ? 'auto' : `${size.height}px`

  popupElement.style.setProperty('--popup-width', width)
  popupElement.style.setProperty('--popup-height', height)
}

function setPositionerCssSize(positionerElement: HTMLElement, size: Dimensions | 'max-content') {
  const width = size === 'max-content' ? 'max-content' : `${size.width}px`
  const height = size === 'max-content' ? 'max-content' : `${size.height}px`

  positionerElement.style.setProperty('--positioner-width', width)
  positionerElement.style.setProperty('--positioner-height', height)
}

function commitPositionerCssSize(positionerElement: HTMLElement, size: Dimensions) {
  setPositionerCssSize(positionerElement, size)

  nextTick(() => {
    if (positionerElement.isConnected) {
      setPositionerCssSize(positionerElement, size)
    }
  })
}
