import type { MaybeRefOrGetter } from 'vue'
import type { Delay, FloatingContext, FloatingRootContext } from '../types'
import { isElement } from '@floating-ui/utils/dom'
import { onScopeDispose, toValue, watchEffect } from 'vue'
import { addEventListener } from '../../utils/addEventListener'
import { createChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import { mergeCleanups } from '../../utils/mergeCleanups'
import { ownerDocument } from '../../utils/owner'
import { REASONS } from '../../utils/reasons'
import { useTimeout } from '../../utils/useTimeout'
import { useFloatingParentNodeId, useFloatingTree } from '../components/FloatingTree'
import { contains, getTarget } from '../utils/element'
import { getNodeChildren } from '../utils/nodes'
import {
  applySafePolygonPointerEventsMutation,
  clearSafePolygonPointerEventsMutation,
  isInteractiveElement,
  useHoverInteractionSharedState,
} from './useHoverInteractionSharedState'
import {
  getDelay,
  isClickLikeOpenEvent as isClickLikeOpenEventShared,
  isHoverOpenEvent,
  isInsideEnabledTrigger,
} from './useHoverShared'

export interface UseHoverFloatingInteractionProps {
  /**
   * Whether the Hook is enabled, including all internal Effects and event
   * handlers.
   * @default true
   */
  enabled?: MaybeRefOrGetter<boolean | undefined>
  /**
   * Waits for the specified time when the event listener runs before changing
   * the `open` state.
   * @default 0
   */
  closeDelay?: MaybeRefOrGetter<Delay | (() => Delay) | undefined>
  /**
   * Tree node id override for floating elements that participate in the tree
   * without a `FloatingContext`, such as inline nested navigation menus.
   */
  nodeId?: MaybeRefOrGetter<string | undefined>
}

/**
 * Provides hover interactions that should be attached to the floating element.
 */
export function useHoverFloatingInteraction(
  context: FloatingRootContext | FloatingContext,
  parameters: UseHoverFloatingInteractionProps = {},
): void {
  const store = 'rootStore' in context ? context.rootStore : context

  const open = store.useState('open')
  const floatingElement = store.useState('floatingElement')
  const domReferenceElement = store.useState('domReferenceElement')
  const { dataRef } = store.context

  const tree = useFloatingTree()
  const parentId = useFloatingParentNodeId()
  const instance = useHoverInteractionSharedState(store)

  const childClosedTimeout = useTimeout()

  function enabled() {
    return toValue(parameters.enabled ?? true) !== false
  }

  function isClickLikeOpenEvent() {
    return isClickLikeOpenEventShared(dataRef.value.openEvent?.type, instance.interactedInside)
  }

  function isHoverOpen() {
    return isHoverOpenEvent(dataRef.value.openEvent?.type)
  }

  function clearPointerEvents() {
    clearSafePolygonPointerEventsMutation(instance)
  }

  watchEffect(() => {
    if (!open.value) {
      instance.pointerType = undefined
      instance.restTimeoutPending = false
      instance.interactedInside = false
      clearPointerEvents()
    }
  })

  onScopeDispose(clearPointerEvents)

  watchEffect((onCleanup) => {
    if (!enabled()) {
      return
    }

    if (
      open.value
      && instance.handleCloseOptions?.blockPointerEvents
      && isHoverOpen()
      && isElement(domReferenceElement.value)
      && floatingElement.value
    ) {
      const ref = domReferenceElement.value as HTMLElement | SVGSVGElement
      const floatingEl = floatingElement.value
      const doc = ownerDocument(floatingEl)

      const parentNode = tree?.nodesRef.value.find(node => node.id === parentId)
      const parentFloating = parentNode?.context?.rootStore.select('floatingElement') ?? null

      if (parentFloating) {
        parentFloating.style.pointerEvents = ''
      }

      const cachedScopeElement
        = instance.pointerEventsScopeElement !== floatingEl
          ? instance.pointerEventsScopeElement
          : null
      const parentScopeElement = parentFloating !== floatingEl ? parentFloating : null
      const scopeElement
        = instance.handleCloseOptions?.getScope?.()
          ?? cachedScopeElement
          ?? parentScopeElement
          ?? (ref.closest('[data-rootownerid]') as HTMLElement | SVGSVGElement | null)
          ?? doc?.body

      if (scopeElement) {
        applySafePolygonPointerEventsMutation(instance, {
          scopeElement,
          referenceElement: ref,
          floatingElement: floatingEl,
        })

        onCleanup(clearPointerEvents)
      }
    }
  })

  watchEffect((onCleanup) => {
    if (!enabled()) {
      return
    }

    function hasParentChildren() {
      return Boolean(tree && parentId && getNodeChildren(tree.nodesRef.value, parentId).length > 0)
    }

    function closeWithDelay(event: MouseEvent) {
      const closeDelay = getDelay(toValue(parameters.closeDelay ?? 0), 'close', instance.pointerType)
      const close = () => {
        store.setOpen(false, createChangeEventDetails(REASONS.triggerHover, event))
        tree?.events.emit('floating.closed', event)
      }

      if (closeDelay) {
        instance.openChangeTimeout.start(closeDelay, close)
      }
      else {
        instance.openChangeTimeout.clear()
        close()
      }
    }

    function handleInteractInside(event: PointerEvent) {
      const target = getTarget(event) as Element | null
      if (!isInteractiveElement(target)) {
        instance.interactedInside = false
        return
      }

      instance.interactedInside = target?.closest('[aria-haspopup]') != null
    }

    function onFloatingMouseEnter() {
      instance.openChangeTimeout.clear()
      store.context.clearCloseTimer?.()
      childClosedTimeout.clear()
      tree?.events.off('floating.closed', onNodeClosed)
      clearPointerEvents()
    }

    function onFloatingMouseLeave(event: MouseEvent) {
      if (hasParentChildren() && tree) {
        tree.events.on('floating.closed', onNodeClosed)
        return
      }

      if (isInsideEnabledTrigger(event.relatedTarget, store.context.triggerElements)) {
        return
      }

      const currentNodeId = dataRef.value.floatingContext?.nodeId ?? toValue(parameters.nodeId)
      const relatedTarget = event.relatedTarget
      const isMovingIntoDescendantFloating
        = tree
          && currentNodeId
          && isElement(relatedTarget)
          && getNodeChildren(tree.nodesRef.value, currentNodeId, false).some(node =>
            contains(node.context?.rootStore.select('floatingElement'), relatedTarget),
          )

      if (isMovingIntoDescendantFloating) {
        return
      }

      if (instance.handler) {
        instance.handler(event)
        return
      }

      clearPointerEvents()
      if (isHoverOpen() && !isClickLikeOpenEvent()) {
        closeWithDelay(event)
      }
    }

    function onNodeClosed(event: MouseEvent) {
      if (!tree || !parentId || hasParentChildren()) {
        return
      }

      childClosedTimeout.start(0, () => {
        tree.events.off('floating.closed', onNodeClosed)
        store.setOpen(false, createChangeEventDetails(REASONS.triggerHover, event))
        tree.events.emit('floating.closed', event)
      })
    }

    const floating = floatingElement.value
    const cleanup = mergeCleanups(
      addEventListener(floating, 'mouseenter', onFloatingMouseEnter),
      addEventListener(floating, 'mouseleave', onFloatingMouseLeave),
      addEventListener(floating, 'pointerdown', handleInteractInside, true),
      () => {
        tree?.events.off('floating.closed', onNodeClosed)
      },
    )

    onCleanup(cleanup)
  })
}
