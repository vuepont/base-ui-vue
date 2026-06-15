import type { ComputedRef, MaybeRefOrGetter, ShallowRef } from 'vue'
import type { TextDirection } from '../direction-provider/DirectionContext'
import type { Dimensions } from '../floating-ui-vue/types'
import type { Side } from './useAnchorPositioning'
import { computed, nextTick, onBeforeUnmount, shallowRef, toValue, watch } from 'vue'
import { TransitionStatusDataAttributes } from './stateAttributesMapping'
import { useAnimationFrame } from './useAnimationFrame'
import { useAnimationsFinished } from './useAnimationsFinished'
import { usePopupAutoResize } from './usePopupAutoResize'

export interface PopupViewportCssVars {
  /**
   * CSS variable name storing the popup width for the previous content snapshot.
   */
  popupWidth: string
  /**
   * CSS variable name storing the popup height for the previous content snapshot.
   */
  popupHeight: string
}

export interface PopupViewportState {
  /**
   * Direction from which the popup was activated, used for directional animations.
   */
  activationDirection: string | undefined
  /**
   * Whether the viewport is currently transitioning between contents.
   */
  transitioning: boolean
}

export interface UsePopupViewportParameters {
  /**
   * The trigger currently associated with the open popup.
   */
  activeTriggerElement: MaybeRefOrGetter<Element | null | undefined>
  /**
   * ID of the active trigger.
   */
  activeTriggerId: MaybeRefOrGetter<string | null | undefined>
  /**
   * Whether the popup is open.
   */
  open: MaybeRefOrGetter<boolean>
  /**
   * Whether the popup is mounted.
   */
  mounted: MaybeRefOrGetter<boolean>
  /**
   * Element to resize.
   */
  popupElement: MaybeRefOrGetter<HTMLElement | null | undefined>
  /**
   * Positioner element, the parent of the popup.
   */
  positionerElement: MaybeRefOrGetter<HTMLElement | null | undefined>
  /**
   * Current logical side of the popup.
   */
  side: MaybeRefOrGetter<Side | undefined>
  /**
   * Current text direction.
   */
  direction: MaybeRefOrGetter<TextDirection>
  /**
   * Trigger payload used to render the current content.
   */
  payload: MaybeRefOrGetter<unknown>
  /**
   * CSS variable names used for sizing the previous content snapshot.
   */
  cssVars: PopupViewportCssVars
}

export interface UsePopupViewportResult {
  /**
   * Ref for the current content container.
   */
  currentContainerRef: ShallowRef<HTMLDivElement | null>
  /**
   * Ref for the previous content snapshot container.
   */
  previousContainerRef: ShallowRef<HTMLDivElement | null>
  /**
   * Key that remounts current content when triggers or delayed payloads change.
   */
  currentContentKey: ComputedRef<string>
  /**
   * Props for the current content container.
   */
  currentContainerProps: ComputedRef<Record<string, unknown>>
  /**
   * Props for the previous content snapshot container.
   */
  previousContainerProps: ComputedRef<Record<string, unknown>>
  /**
   * Whether the previous content snapshot should be rendered.
   */
  transitioning: ComputedRef<boolean>
  /**
   * Viewport state used for data attributes and render prop styling.
   */
  state: ComputedRef<PopupViewportState>
}

/**
 * Builds morphing viewport containers for popups that animate between trigger-based content.
 * Vue renders the new content normally and keeps a cloned DOM snapshot of the previous content
 * around until the current container's animations finish.
 */
export function usePopupViewport(parameters: UsePopupViewportParameters): UsePopupViewportResult {
  const activeTriggerElement = computed(() => toValue(parameters.activeTriggerElement) ?? null)
  const activeTriggerId = computed(() => toValue(parameters.activeTriggerId) ?? null)
  const open = computed(() => toValue(parameters.open))
  const mounted = computed(() => toValue(parameters.mounted))
  const payload = computed(() => toValue(parameters.payload))

  const currentContainerRef = shallowRef<HTMLDivElement | null>(null)
  const previousContainerRef = shallowRef<HTMLDivElement | null>(null)
  const previousContentNode = shallowRef<HTMLDivElement | null>(null)
  const previousContentDimensions = shallowRef<{ width: number, height: number } | null>(null)
  const newTriggerOffset = shallowRef<Offset | null>(null)
  const showStartingStyleAttribute = shallowRef(false)
  const lastHandledTrigger = shallowRef<Element | null>(null)

  const cleanupFrame = useAnimationFrame()
  const onAnimationsFinished = useAnimationsFinished(currentContainerRef, true, false)
  let animationAbortController: AbortController | null = null

  const currentContentKey = usePopupContentKey(activeTriggerId, payload)

  function abortPendingAnimationCleanup() {
    animationAbortController?.abort()
    animationAbortController = null
  }

  function clearPreviousContent() {
    previousContentNode.value = null
    previousContentDimensions.value = null
  }

  watch(
    activeTriggerElement,
    (nextTrigger, previousTrigger) => {
      if (
        !open.value
        || !nextTrigger
        || !previousTrigger
        || nextTrigger === previousTrigger
        || lastHandledTrigger.value === nextTrigger
        || !currentContainerRef.value
      ) {
        return
      }

      abortPendingAnimationCleanup()

      previousContentNode.value = cloneContent(currentContainerRef.value)
      previousContentDimensions.value = measureElement(currentContainerRef.value)
      showStartingStyleAttribute.value = true
      newTriggerOffset.value = calculateRelativePosition(previousTrigger, nextTrigger)
      const currentAnimationAbortController = new AbortController()
      animationAbortController = currentAnimationAbortController

      cleanupFrame.request(() => {
        showStartingStyleAttribute.value = false

        nextTick(() => {
          onAnimationsFinished(() => {
            if (currentAnimationAbortController.signal.aborted) {
              return
            }

            if (animationAbortController === currentAnimationAbortController) {
              animationAbortController = null
            }

            clearPreviousContent()
          }, currentAnimationAbortController.signal)
        })
      })

      lastHandledTrigger.value = nextTrigger
    },
    { flush: 'pre' },
  )

  watch(open, (isOpen) => {
    if (!isOpen) {
      abortPendingAnimationCleanup()
      clearPreviousContent()
      newTriggerOffset.value = null
      lastHandledTrigger.value = null
    }
  })

  watch(
    [previousContainerRef, previousContentNode],
    async ([container, previousNode]) => {
      if (!container || !previousNode) {
        return
      }

      await nextTick()

      container.replaceChildren(
        ...Array.from(previousNode.childNodes).map(node => node.cloneNode(true)),
      )
    },
    { flush: 'post' },
  )

  onBeforeUnmount(() => {
    abortPendingAnimationCleanup()
    cleanupFrame.cancel()
  })

  function handleMeasureLayout() {
    currentContainerRef.value?.style.setProperty('animation', 'none')
    currentContainerRef.value?.style.setProperty('transition', 'none')

    previousContainerRef.value?.style.setProperty('display', 'none')
  }

  function handleMeasureLayoutComplete(previousDimensions: Dimensions | null) {
    currentContainerRef.value?.style.removeProperty('animation')
    currentContainerRef.value?.style.removeProperty('transition')

    previousContainerRef.value?.style.removeProperty('display')

    if (previousDimensions && (previousDimensions.width > 0 || previousDimensions.height > 0)) {
      previousContentDimensions.value = previousDimensions
    }
  }

  usePopupAutoResize({
    popupElement: parameters.popupElement,
    positionerElement: parameters.positionerElement,
    mounted,
    content: payload,
    onMeasureLayout: handleMeasureLayout,
    onMeasureLayoutComplete: handleMeasureLayoutComplete,
    side: parameters.side,
    direction: parameters.direction,
  })

  const transitioning = computed(() => previousContentNode.value != null)

  const currentContainerProps = computed(() => ({
    'data-current': '',
    [TransitionStatusDataAttributes.startingStyle]: showStartingStyleAttribute.value
      ? ''
      : undefined,
  }))

  const previousContainerProps = computed(() => ({
    'data-previous': '',
    'inert': '',
    [TransitionStatusDataAttributes.endingStyle]: showStartingStyleAttribute.value
      ? undefined
      : '',
    'style': {
      ...(previousContentDimensions.value
        ? {
            [parameters.cssVars.popupWidth]: `${previousContentDimensions.value.width}px`,
            [parameters.cssVars.popupHeight]: `${previousContentDimensions.value.height}px`,
          }
        : null),
      position: 'absolute',
    },
  }))

  const state = computed<PopupViewportState>(() => ({
    activationDirection: getActivationDirection(newTriggerOffset.value),
    transitioning: transitioning.value,
  }))

  return {
    currentContainerRef,
    previousContainerRef,
    currentContentKey,
    currentContainerProps,
    previousContainerProps,
    transitioning,
    state,
  }
}

interface Offset {
  horizontal: number
  vertical: number
}

function cloneContent(source: HTMLElement) {
  const wrapper = source.ownerDocument.createElement('div')

  for (const child of Array.from(source.childNodes)) {
    wrapper.appendChild(child.cloneNode(true))
  }

  return wrapper
}

function measureElement(element: HTMLElement) {
  const rect = element.getBoundingClientRect()

  return {
    width: rect.width,
    height: rect.height,
  }
}

/**
 * Returns a string describing both the horizontal and vertical offset.
 */
function getActivationDirection(offset: Offset | null): string | undefined {
  if (!offset) {
    return undefined
  }

  return `${getValueWithTolerance(offset.horizontal, 5, 'right', 'left')} ${getValueWithTolerance(offset.vertical, 5, 'down', 'up')}`
}

function getValueWithTolerance(
  value: number,
  tolerance: number,
  positiveLabel: string,
  negativeLabel: string,
) {
  if (value > tolerance) {
    return positiveLabel
  }

  if (value < -tolerance) {
    return negativeLabel
  }

  return ''
}

/**
 * Calculates the relative position between centers of two elements.
 */
function calculateRelativePosition(from: Element, to: Element): Offset {
  const fromRect = from.getBoundingClientRect()
  const toRect = to.getBoundingClientRect()

  const fromCenter = {
    x: fromRect.left + fromRect.width / 2,
    y: fromRect.top + fromRect.height / 2,
  }
  const toCenter = {
    x: toRect.left + toRect.width / 2,
    y: toRect.top + toRect.height / 2,
  }

  return {
    horizontal: toCenter.x - fromCenter.x,
    vertical: toCenter.y - fromCenter.y,
  }
}

/**
 * Returns a key that forces remounting content when triggers change or a payload is updated.
 */
function usePopupContentKey(
  activeTriggerId: ComputedRef<string | null>,
  payload: ComputedRef<unknown>,
): ComputedRef<string> {
  const contentKey = shallowRef(0)
  const previousActiveTriggerId = shallowRef(activeTriggerId.value)
  const previousPayload = shallowRef(payload.value)
  const pendingPayloadUpdate = shallowRef(false)

  watch(
    [activeTriggerId, payload],
    ([nextActiveTriggerId, nextPayload]) => {
      const triggerIdChanged = nextActiveTriggerId !== previousActiveTriggerId.value
      const payloadChanged = nextPayload !== previousPayload.value

      if (triggerIdChanged) {
        contentKey.value += 1
        pendingPayloadUpdate.value = !payloadChanged
      }
      else if (pendingPayloadUpdate.value && payloadChanged) {
        contentKey.value += 1
        pendingPayloadUpdate.value = false
      }

      previousActiveTriggerId.value = nextActiveTriggerId
      previousPayload.value = nextPayload
    },
    { flush: 'pre' },
  )

  return computed(() => `${activeTriggerId.value ?? 'current'}-${contentKey.value}`)
}
