import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { BaseUIChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import type {
  ContextData,
  FloatingRootContext,
  FloatingRootState,
  FloatingTriggerMap,
  ReferenceType,
} from '../types'
import { computed, shallowRef, toValue } from 'vue'
import { createEventEmitter } from '../utils/createEventEmitter'
import { isClickLikeEvent } from '../utils/event'

export interface CreateFloatingRootContextOptions {
  open: MaybeRefOrGetter<boolean>
  transitionStatus: MaybeRefOrGetter<TransitionStatus>
  domReferenceElement: MaybeRefOrGetter<Element | null>
  referenceElement: MaybeRefOrGetter<ReferenceType | null>
  floatingElement: MaybeRefOrGetter<HTMLElement | null>
  floatingId: MaybeRefOrGetter<string | undefined>
  triggerElements: FloatingTriggerMap
  nested?: boolean
  onOpenChange?: (open: boolean, eventDetails: BaseUIChangeEventDetails<string, any>) => void
  clearCloseTimer?: () => void
}

export function createFloatingRootContext(
  options: CreateFloatingRootContextOptions,
): FloatingRootContext {
  const state: { [K in keyof FloatingRootState]: ComputedRef<FloatingRootState[K]> } = {
    open: computed(() => toValue(options.open)),
    transitionStatus: computed(() => toValue(options.transitionStatus)),
    domReferenceElement: computed(() => toValue(options.domReferenceElement)),
    referenceElement: computed(() => toValue(options.referenceElement)),
    floatingElement: computed(() => toValue(options.floatingElement)),
    floatingId: computed(() => toValue(options.floatingId)),
  }

  const context = {
    dataRef: shallowRef<ContextData>({}),
    events: createEventEmitter(),
    nested: options.nested ?? false,
    triggerElements: options.triggerElements,
    clearCloseTimer: options.clearCloseTimer,
  }

  const rootContext: FloatingRootContext = {
    context,
    useState(key) {
      return state[key]
    },
    select(key) {
      return state[key].value as FloatingRootState[typeof key]
    },
    setOpen(open, eventDetails) {
      options.onOpenChange?.(open, eventDetails)
    },
    dispatchOpenChange(open, eventDetails) {
      syncOpenEvent(open, eventDetails.event)

      context.events.emit('openchange', {
        open,
        reason: eventDetails.reason,
        nativeEvent: eventDetails.event,
        nested: context.nested,
        triggerElement: eventDetails.trigger,
      })
    },
  }

  function syncOpenEvent(open: boolean, event: Event | undefined) {
    if (
      !open
      || !state.open.value
      || (event != null && isClickLikeEvent(event))
    ) {
      context.dataRef.value.openEvent = open ? event : undefined
    }
  }

  return rootContext
}
