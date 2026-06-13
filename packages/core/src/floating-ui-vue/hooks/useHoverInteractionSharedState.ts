import type { FloatingRootContext, HandleCloseOptions } from '../types'
import { onScopeDispose } from 'vue'
import { Timeout } from '../../utils/useTimeout'
import { isInteractiveElement } from '../utils/element'

export { isInteractiveElement }

export class HoverInteraction {
  pointerType: string | undefined
  interactedInside: boolean
  handler: ((event: MouseEvent) => void) | undefined
  blockMouseMove: boolean
  performedPointerEventsMutation: boolean
  pointerEventsScopeElement: HTMLElement | SVGSVGElement | null
  pointerEventsReferenceElement: HTMLElement | SVGSVGElement | null
  pointerEventsFloatingElement: HTMLElement | null
  restTimeoutPending: boolean
  openChangeTimeout: Timeout
  restTimeout: Timeout
  handleCloseOptions: HandleCloseOptions | undefined

  constructor() {
    this.pointerType = undefined
    this.interactedInside = false
    this.handler = undefined
    this.blockMouseMove = true
    this.performedPointerEventsMutation = false
    this.pointerEventsScopeElement = null
    this.pointerEventsReferenceElement = null
    this.pointerEventsFloatingElement = null
    this.restTimeoutPending = false
    this.openChangeTimeout = new Timeout()
    this.restTimeout = new Timeout()
    this.handleCloseOptions = undefined
  }

  static create(): HoverInteraction {
    return new HoverInteraction()
  }

  dispose = () => {
    this.openChangeTimeout.clear()
    this.restTimeout.clear()
  }
}

type PointerEventsMutationState = Pick<
  HoverInteraction,
  | 'performedPointerEventsMutation'
  | 'pointerEventsScopeElement'
  | 'pointerEventsReferenceElement'
  | 'pointerEventsFloatingElement'
>

const pointerEventsMutationOwnerByScopeElement = new WeakMap<
  HTMLElement | SVGSVGElement,
  PointerEventsMutationState
>()

export function clearSafePolygonPointerEventsMutation(instance: PointerEventsMutationState) {
  if (!instance.performedPointerEventsMutation) {
    return
  }

  const scopeElement = instance.pointerEventsScopeElement

  if (scopeElement && pointerEventsMutationOwnerByScopeElement.get(scopeElement) === instance) {
    instance.pointerEventsScopeElement?.style.removeProperty('pointer-events')
    instance.pointerEventsReferenceElement?.style.removeProperty('pointer-events')
    instance.pointerEventsFloatingElement?.style.removeProperty('pointer-events')
    pointerEventsMutationOwnerByScopeElement.delete(scopeElement)
  }

  instance.performedPointerEventsMutation = false
  instance.pointerEventsScopeElement = null
  instance.pointerEventsReferenceElement = null
  instance.pointerEventsFloatingElement = null
}

export function applySafePolygonPointerEventsMutation(
  instance: PointerEventsMutationState,
  options: {
    scopeElement: HTMLElement | SVGSVGElement
    referenceElement: HTMLElement | SVGSVGElement
    floatingElement: HTMLElement
  },
) {
  const { scopeElement, referenceElement, floatingElement } = options

  const existingOwner = pointerEventsMutationOwnerByScopeElement.get(scopeElement)
  if (existingOwner && existingOwner !== instance) {
    clearSafePolygonPointerEventsMutation(existingOwner)
  }

  clearSafePolygonPointerEventsMutation(instance)
  instance.performedPointerEventsMutation = true
  instance.pointerEventsScopeElement = scopeElement
  instance.pointerEventsReferenceElement = referenceElement
  instance.pointerEventsFloatingElement = floatingElement
  pointerEventsMutationOwnerByScopeElement.set(scopeElement, instance)

  scopeElement.style.pointerEvents = 'none'
  referenceElement.style.pointerEvents = 'auto'
  floatingElement.style.pointerEvents = 'auto'
}

interface HoverContextData {
  hoverInteractionState?: HoverInteraction
}

export function getHoverInteractionSharedState(store: FloatingRootContext): HoverInteraction {
  const data = store.context.dataRef.value as HoverContextData

  if (!data.hoverInteractionState) {
    data.hoverInteractionState = HoverInteraction.create()
  }

  return data.hoverInteractionState
}

export function useHoverInteractionSharedState(store: FloatingRootContext): HoverInteraction {
  const instance = getHoverInteractionSharedState(store)
  onScopeDispose(instance.dispose)
  return instance
}
