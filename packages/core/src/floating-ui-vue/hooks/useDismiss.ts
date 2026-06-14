import type { MaybeRefOrGetter } from 'vue'
import type { FloatingTreeStore } from '../components/FloatingTreeStore'
import type { ElementProps, FloatingContext, FloatingRootContext } from '../types'
import {
  getComputedStyle,
  getParentNode,
  isElement,
  isHTMLElement,
  isLastTraversableNode,
  isShadowRoot,
} from '@floating-ui/utils/dom'
import { onScopeDispose, shallowRef, toValue, watchEffect } from 'vue'
import { addEventListener } from '../../utils/addEventListener'
import { createChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import { mergeCleanups } from '../../utils/mergeCleanups'
import { ownerDocument } from '../../utils/owner'
import { platform } from '../../utils/platform'
import { REASONS } from '../../utils/reasons'
import { Timeout, useTimeout } from '../../utils/useTimeout'
import { useFloatingTree } from '../components/FloatingTree'
import { createAttribute } from '../utils/createAttribute'
import { contains, getTarget, isEventTargetWithin, isRootElement } from '../utils/element'
import { getNodeChildren } from '../utils/nodes'

type PressType = 'intentional' | 'sloppy'

function alwaysFalse() {
  return false
}

export function normalizeProp(
  normalizable?: boolean | { escapeKey?: boolean | undefined, outsidePress?: boolean | undefined },
) {
  return {
    escapeKey:
      typeof normalizable === 'boolean' ? normalizable : (normalizable?.escapeKey ?? false),
    outsidePress:
      typeof normalizable === 'boolean' ? normalizable : (normalizable?.outsidePress ?? true),
  }
}

export interface UseDismissProps {
  /**
   * Whether the Hook is enabled, including all internal Effects and event
   * handlers.
   * @default true
   */
  enabled?: MaybeRefOrGetter<boolean | undefined>
  /**
   * Whether to dismiss the floating element upon pressing the `esc` key.
   * @default true
   */
  escapeKey?: MaybeRefOrGetter<boolean | undefined>
  /**
   * Whether to dismiss the floating element upon pressing the reference
   * element.
   *
   * A lazy getter invoked when handling reference press events.
   * @default false
   */
  referencePress?: (() => boolean) | undefined
  /**
   * Whether to dismiss the floating element upon pressing outside of the
   * floating element.
   * @default true
   */
  outsidePress?: boolean | ((event: MouseEvent | TouchEvent) => boolean) | undefined
  /**
   * The type of event to use to determine an outside "press".
   */
  outsidePressEvent?:
    | PressType
    | {
      mouse: PressType
      touch: PressType
    }
    | (() =>
      | PressType
      | {
        mouse: PressType
        touch: PressType
      })
      | undefined
  /**
   * Determines whether event listeners bubble upwards through a tree of
   * floating elements.
   */
  bubbles?:
    | MaybeRefOrGetter<boolean
    | { escapeKey?: boolean | undefined, outsidePress?: boolean | undefined }
    | undefined>
  /**
   * External FloatingTree to use when the one provided by context can't be used.
   */
  externalTree?: FloatingTreeStore | undefined
}

/**
 * Closes the floating element when a dismissal is requested — by default, when
 * the user presses the `escape` key or outside of the floating element.
 * @see https://floating-ui.com/docs/useDismiss
 */
export function useDismiss(
  context: FloatingRootContext | FloatingContext,
  props: UseDismissProps = {},
): ElementProps {
  const store = 'rootStore' in context ? context.rootStore : context

  const open = store.useState('open')
  const floatingElement = store.useState('floatingElement')
  const domReferenceElement = store.useState('domReferenceElement')
  const { dataRef } = store.context

  const tree = useFloatingTree(props.externalTree)

  const pressStartedInsideRef = shallowRef(false)
  const pressStartPreventedRef = shallowRef(false)
  const suppressNextOutsideClickRef = shallowRef(false)
  const isComposingRef = shallowRef(false)
  const currentPointerTypeRef = shallowRef<PointerEvent['pointerType']>('')

  const touchStateRef = shallowRef<{
    startTime: number
    startX: number
    startY: number
    dismissOnTouchEnd: boolean
    dismissOnMouseDown: boolean
  } | null>(null)

  const cancelDismissOnEndTimeout = useTimeout()
  const clearInsideVueTreeTimeout = useTimeout()

  function enabled() {
    return toValue(props.enabled ?? true) !== false
  }

  function escapeKey() {
    return toValue(props.escapeKey ?? true) !== false
  }

  function referencePress() {
    return (props.referencePress ?? alwaysFalse)()
  }

  function outsidePress() {
    return props.outsidePress ?? true
  }

  function outsidePressEnabled() {
    return outsidePress() !== false
  }

  function getBubbles() {
    return normalizeProp(toValue(props.bubbles))
  }

  function clearInsideVueTree() {
    clearInsideVueTreeTimeout.clear()
    dataRef.value.insideVueTree = false
  }

  function hasBlockingChild(bubbleKey: '__escapeKeyBubbles' | '__outsidePressBubbles') {
    const nodeId = dataRef.value.floatingContext?.nodeId
    const children = tree ? getNodeChildren(tree.nodesRef.value, nodeId) : []

    return children.some((child) => {
      return child.context?.open.value && !child.context.rootStore.context.dataRef.value[bubbleKey]
    })
  }

  function isEventWithinOwnElements(event: Event) {
    return (
      isEventTargetWithin(event, store.select('floatingElement'))
      || isEventTargetWithin(event, store.select('domReferenceElement'))
    )
  }

  function closeOnReferencePress(event: Event) {
    if (!enabled() || !referencePress()) {
      return
    }

    store.setOpen(
      false,
      createChangeEventDetails(
        REASONS.triggerPress,
        event as MouseEvent | PointerEvent | TouchEvent | KeyboardEvent,
      ),
    )
  }

  function closeOnEscapeKeyDown(event: KeyboardEvent) {
    if (!open.value || !enabled() || !escapeKey() || event.key !== 'Escape') {
      return
    }

    if (isComposingRef.value) {
      return
    }

    const { escapeKey: escapeKeyBubbles } = getBubbles()

    if (!escapeKeyBubbles && hasBlockingChild('__escapeKeyBubbles')) {
      return
    }

    const eventDetails = createChangeEventDetails(REASONS.escapeKey, event)

    store.setOpen(false, eventDetails)

    if (!eventDetails.isCanceled) {
      event.preventDefault()
    }

    if (!escapeKeyBubbles && !eventDetails.isPropagationAllowed) {
      event.stopPropagation()
    }
  }

  function markInsideVueTree() {
    dataRef.value.insideVueTree = true
    clearInsideVueTreeTimeout.start(0, clearInsideVueTree)
  }

  function markPressStartedInsideVueTree(event: PointerEvent | MouseEvent) {
    if (!open.value || !enabled() || event.button !== 0) {
      return
    }

    const target = getTarget(event) as Element | null

    if (!contains(store.select('floatingElement'), target)) {
      return
    }

    if (!pressStartedInsideRef.value) {
      pressStartedInsideRef.value = true
      pressStartPreventedRef.value = false
    }
  }

  function markInsidePressStartPrevented(event: PointerEvent | MouseEvent) {
    if (!open.value || !enabled()) {
      return
    }

    if (!event.defaultPrevented) {
      return
    }

    if (pressStartedInsideRef.value) {
      pressStartPreventedRef.value = true
    }
  }

  function resetPressStartState() {
    pressStartedInsideRef.value = false
    pressStartPreventedRef.value = false
  }

  function getOutsidePressEvent(): PressType {
    const type = currentPointerTypeRef.value as 'pen' | 'mouse' | 'touch' | ''
    const computedType = type === 'pen' || !type ? 'mouse' : type
    const outsidePressEvent = props.outsidePressEvent ?? 'sloppy'
    const resolved = typeof outsidePressEvent === 'function'
      ? outsidePressEvent()
      : outsidePressEvent

    if (typeof resolved === 'string') {
      return resolved
    }

    return resolved[computedType]
  }

  function shouldIgnoreEvent(event: Event) {
    const computedOutsidePressEvent = getOutsidePressEvent()
    return (
      (computedOutsidePressEvent === 'intentional' && event.type !== 'click')
      || (computedOutsidePressEvent === 'sloppy' && event.type === 'click')
    )
  }

  function isEventWithinFloatingTree(event: Event) {
    const nodeId = dataRef.value.floatingContext?.nodeId
    const targetIsInsideChildren
      = tree
        && getNodeChildren(tree.nodesRef.value, nodeId).some(node =>
          isEventTargetWithin(event, node.context?.rootStore.select('floatingElement')),
        )

    return isEventWithinOwnElements(event) || Boolean(targetIsInsideChildren)
  }

  function addTargetEventListenerOnce<EventType extends Event>(
    event: EventType,
    listener: (event: EventType) => void,
  ) {
    const target = getTarget(event)

    if (!target) {
      return
    }

    const eventTarget = target as EventTarget
    const handler = () => {
      listener(event)
      eventTarget.removeEventListener(event.type, handler)
    }

    eventTarget.addEventListener(event.type, handler)
  }

  watchEffect((onCleanup) => {
    if (!open.value || !enabled()) {
      return
    }

    const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } = getBubbles()
    dataRef.value.__escapeKeyBubbles = escapeKeyBubbles
    dataRef.value.__outsidePressBubbles = outsidePressBubbles

    const compositionTimeout = new Timeout()
    const preventedPressSuppressionTimeout = new Timeout()

    function handleCompositionStart() {
      compositionTimeout.clear()
      isComposingRef.value = true
    }

    function handleCompositionEnd() {
      compositionTimeout.start(
        platform.engine.webkit ? 5 : 0,
        () => {
          isComposingRef.value = false
        },
      )
    }

    function suppressImmediateOutsideClickAfterPreventedStart() {
      suppressNextOutsideClickRef.value = true
      preventedPressSuppressionTimeout.start(0, () => {
        suppressNextOutsideClickRef.value = false
      })
    }

    function closeOnPressOutside(event: MouseEvent | PointerEvent | TouchEvent) {
      if (shouldIgnoreEvent(event)) {
        if (event.type !== 'click' && !isEventWithinOwnElements(event)) {
          preventedPressSuppressionTimeout.clear()
          suppressNextOutsideClickRef.value = false
        }
        clearInsideVueTree()
        return
      }

      if (dataRef.value.insideVueTree) {
        clearInsideVueTree()
        return
      }

      const target = getTarget(event)
      const inertSelector = `[${createAttribute('inert')}]`
      const targetRoot = isElement(target) ? target.getRootNode() : null
      const doc = ownerDocument(store.select('floatingElement'))
      const markers = Array.from(
        (isShadowRoot(targetRoot) ? targetRoot : doc)?.querySelectorAll(inertSelector) ?? [],
      )

      const triggers = store.context.triggerElements

      if (
        target
        && (triggers.hasElement(target as Element)
          || triggers.hasMatchingElement(trigger => contains(trigger, target as Element)))
      ) {
        return
      }

      let targetRootAncestor = isElement(target) ? target : null
      while (targetRootAncestor && !isLastTraversableNode(targetRootAncestor)) {
        const nextParent = getParentNode(targetRootAncestor)
        if (isLastTraversableNode(nextParent) || !isElement(nextParent)) {
          break
        }

        targetRootAncestor = nextParent
      }

      if (
        markers.length
        && isElement(target)
        && !isRootElement(target)
        && !contains(target, store.select('floatingElement'))
        && markers.every(marker => !contains(targetRootAncestor, marker))
      ) {
        return
      }

      if (isHTMLElement(target) && !('touches' in event)) {
        const lastTraversableNode = isLastTraversableNode(target)
        const style = getComputedStyle(target)
        const scrollRe = /auto|scroll/
        const isScrollableX = lastTraversableNode || scrollRe.test(style.overflowX)
        const isScrollableY = lastTraversableNode || scrollRe.test(style.overflowY)

        const canScrollX
          = isScrollableX && target.clientWidth > 0 && target.scrollWidth > target.clientWidth
        const canScrollY
          = isScrollableY && target.clientHeight > 0 && target.scrollHeight > target.clientHeight

        const isRTL = style.direction === 'rtl'
        const pressedVerticalScrollbar
          = canScrollY
            && (isRTL
              ? event.offsetX <= target.offsetWidth - target.clientWidth
              : event.offsetX > target.clientWidth)
        const pressedHorizontalScrollbar = canScrollX && event.offsetY > target.clientHeight

        if (pressedVerticalScrollbar || pressedHorizontalScrollbar) {
          return
        }
      }

      if (isEventWithinFloatingTree(event)) {
        return
      }

      if (getOutsidePressEvent() === 'intentional' && suppressNextOutsideClickRef.value) {
        preventedPressSuppressionTimeout.clear()
        suppressNextOutsideClickRef.value = false
        return
      }

      const shouldDismiss = outsidePress()
      if (typeof shouldDismiss === 'function' && !shouldDismiss(event)) {
        return
      }

      if (hasBlockingChild('__outsidePressBubbles')) {
        return
      }

      store.setOpen(false, createChangeEventDetails(REASONS.outsidePress, event))
      clearInsideVueTree()
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        getOutsidePressEvent() !== 'sloppy'
        || event.pointerType === 'touch'
        || !store.select('open')
        || !enabled()
        || isEventWithinOwnElements(event)
      ) {
        return
      }

      closeOnPressOutside(event)
    }

    function handleTouchStart(event: TouchEvent) {
      if (
        getOutsidePressEvent() !== 'sloppy'
        || !store.select('open')
        || !enabled()
        || isEventWithinOwnElements(event)
      ) {
        return
      }

      const touch = event.touches[0]
      if (touch) {
        touchStateRef.value = {
          startTime: Date.now(),
          startX: touch.clientX,
          startY: touch.clientY,
          dismissOnTouchEnd: false,
          dismissOnMouseDown: true,
        }

        cancelDismissOnEndTimeout.start(1000, () => {
          if (touchStateRef.value) {
            touchStateRef.value.dismissOnTouchEnd = false
            touchStateRef.value.dismissOnMouseDown = false
          }
        })
      }
    }

    function handleTouchStartCapture(event: TouchEvent) {
      currentPointerTypeRef.value = 'touch'
      addTargetEventListenerOnce(event, handleTouchStart)
    }

    function closeOnPressOutsideCapture(event: PointerEvent | MouseEvent) {
      cancelDismissOnEndTimeout.clear()

      if (event.type === 'pointerdown') {
        currentPointerTypeRef.value = (event as PointerEvent).pointerType
      }

      if (
        event.type === 'mousedown'
        && touchStateRef.value
        && !touchStateRef.value.dismissOnMouseDown
      ) {
        return
      }

      addTargetEventListenerOnce(event, (targetEvent) => {
        if (targetEvent.type === 'pointerdown') {
          handlePointerDown(targetEvent as PointerEvent)
        }
        else {
          closeOnPressOutside(targetEvent as MouseEvent)
        }
      })
    }

    function handlePressEndCapture(event: PointerEvent | MouseEvent) {
      if (!pressStartedInsideRef.value) {
        return
      }

      const pressStartedInsideDefaultPrevented = pressStartPreventedRef.value
      resetPressStartState()

      if (getOutsidePressEvent() !== 'intentional') {
        return
      }

      if (event.type === 'pointercancel') {
        if (pressStartedInsideDefaultPrevented) {
          suppressImmediateOutsideClickAfterPreventedStart()
        }
        return
      }

      if (isEventWithinFloatingTree(event)) {
        return
      }

      if (pressStartedInsideDefaultPrevented) {
        suppressImmediateOutsideClickAfterPreventedStart()
        return
      }

      const shouldDismiss = outsidePress()
      if (typeof shouldDismiss === 'function' && !shouldDismiss(event as MouseEvent)) {
        return
      }

      preventedPressSuppressionTimeout.clear()
      suppressNextOutsideClickRef.value = true
      clearInsideVueTree()
    }

    function handleTouchMove(event: TouchEvent) {
      if (
        getOutsidePressEvent() !== 'sloppy'
        || !touchStateRef.value
        || isEventWithinOwnElements(event)
      ) {
        return
      }

      const touch = event.touches[0]
      if (!touch) {
        return
      }

      const deltaX = Math.abs(touch.clientX - touchStateRef.value.startX)
      const deltaY = Math.abs(touch.clientY - touchStateRef.value.startY)
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (distance > 5) {
        touchStateRef.value.dismissOnTouchEnd = true
      }

      if (distance > 10) {
        closeOnPressOutside(event)
        cancelDismissOnEndTimeout.clear()
        touchStateRef.value = null
      }
    }

    function handleTouchMoveCapture(event: TouchEvent) {
      addTargetEventListenerOnce(event, handleTouchMove)
    }

    function handleTouchEnd(event: TouchEvent) {
      if (
        getOutsidePressEvent() !== 'sloppy'
        || !touchStateRef.value
        || isEventWithinOwnElements(event)
      ) {
        return
      }

      if (touchStateRef.value.dismissOnTouchEnd) {
        closeOnPressOutside(event)
      }

      cancelDismissOnEndTimeout.clear()
      touchStateRef.value = null
    }

    function handleTouchEndCapture(event: TouchEvent) {
      addTargetEventListenerOnce(event, handleTouchEnd)
    }

    const doc = ownerDocument(floatingElement.value ?? domReferenceElement.value)
    const unsubscribe = mergeCleanups(
      escapeKey()
        ? mergeCleanups(
            addEventListener(doc, 'keydown', closeOnEscapeKeyDown),
            addEventListener(doc, 'compositionstart', handleCompositionStart),
            addEventListener(doc, 'compositionend', handleCompositionEnd),
          )
        : undefined,
      outsidePressEnabled()
        ? mergeCleanups(
            addEventListener(doc, 'click', closeOnPressOutsideCapture, true),
            addEventListener(doc, 'pointerdown', closeOnPressOutsideCapture, true),
            addEventListener(doc, 'pointerup', handlePressEndCapture, true),
            addEventListener(doc, 'pointercancel', handlePressEndCapture, true),
            addEventListener(doc, 'mousedown', closeOnPressOutsideCapture, true),
            addEventListener(doc, 'mouseup', handlePressEndCapture, true),
            addEventListener(doc, 'touchstart', handleTouchStartCapture, true),
            addEventListener(doc, 'touchmove', handleTouchMoveCapture, true),
            addEventListener(doc, 'touchend', handleTouchEndCapture, true),
          )
        : undefined,
    )

    onCleanup(() => {
      unsubscribe()
      compositionTimeout.clear()
      preventedPressSuppressionTimeout.clear()
      resetPressStartState()
      suppressNextOutsideClickRef.value = false
    })
  })

  watchEffect(() => {
    outsidePress()
    clearInsideVueTree()
  })

  onScopeDispose(() => {
    cancelDismissOnEndTimeout.clear()
    clearInsideVueTreeTimeout.clear()
  })

  const reference = {
    onKeydown: closeOnEscapeKeyDown,
    onPointerdown: closeOnReferencePress,
    onClick: closeOnReferencePress,
  }

  const floating = {
    onKeydown: closeOnEscapeKeyDown,
    onPointerdown: markInsidePressStartPrevented,
    onMousedown: markInsidePressStartPrevented,
    onClickCapture: markInsideVueTree,
    onMousedownCapture(event: MouseEvent) {
      markInsideVueTree()
      markPressStartedInsideVueTree(event)
    },
    onPointerdownCapture(event: PointerEvent) {
      markInsideVueTree()
      markPressStartedInsideVueTree(event)
    },
    onMouseupCapture: markInsideVueTree,
    onTouchendCapture: markInsideVueTree,
    onTouchmoveCapture: markInsideVueTree,
  }

  return {
    reference,
    floating,
    trigger: reference,
  }
}
