import type { REASONS } from './reasons'
import { EMPTY_OBJECT } from './empty'

interface ReasonToEventMap {
  [REASONS.none]: Event

  [REASONS.triggerPress]: MouseEvent | PointerEvent | TouchEvent | KeyboardEvent
  [REASONS.triggerHover]: MouseEvent
  [REASONS.triggerFocus]: FocusEvent

  [REASONS.outsidePress]: MouseEvent | PointerEvent | TouchEvent
  [REASONS.itemPress]: MouseEvent | KeyboardEvent | PointerEvent
  [REASONS.closePress]: MouseEvent | KeyboardEvent | PointerEvent
  [REASONS.linkPress]: MouseEvent | PointerEvent
  [REASONS.clearPress]: PointerEvent | MouseEvent | KeyboardEvent
  [REASONS.chipRemovePress]: PointerEvent | MouseEvent | KeyboardEvent
  [REASONS.trackPress]: PointerEvent | MouseEvent | TouchEvent
  [REASONS.incrementPress]: PointerEvent | MouseEvent | TouchEvent
  [REASONS.decrementPress]: PointerEvent | MouseEvent | TouchEvent

  [REASONS.inputChange]: InputEvent | Event
  [REASONS.inputClear]: InputEvent | FocusEvent | Event
  [REASONS.inputBlur]: FocusEvent
  [REASONS.inputPaste]: ClipboardEvent
  [REASONS.inputPress]: MouseEvent | PointerEvent | TouchEvent | KeyboardEvent

  [REASONS.focusOut]: FocusEvent | KeyboardEvent
  [REASONS.escapeKey]: KeyboardEvent
  [REASONS.closeWatcher]: Event
  [REASONS.listNavigation]: KeyboardEvent
  [REASONS.keyboard]: KeyboardEvent

  [REASONS.pointer]: PointerEvent
  [REASONS.drag]: PointerEvent | TouchEvent
  [REASONS.swipe]: PointerEvent | TouchEvent
  [REASONS.wheel]: WheelEvent
  [REASONS.scrub]: PointerEvent

  [REASONS.cancelOpen]: MouseEvent
  [REASONS.siblingOpen]: Event
  [REASONS.disabled]: Event
  [REASONS.imperativeAction]: Event

  [REASONS.windowResize]: UIEvent
}

/**
 * Maps a change `reason` string to the corresponding native event type.
 */
export type ReasonToEvent<Reason extends string> = Reason extends keyof ReasonToEventMap
  ? ReasonToEventMap[Reason]
  : Event

// export interface BaseUIChangeEventDetail<Reason extends string> {
// interface BaseUIChangeEventDetail<Reason extends string, CustomProperties extends object> {
type BaseUIChangeEventDetail<Reason extends string, CustomProperties extends object> = {

  /**
   * The native event associated with the custom event.
   */
  reason: Reason
  /**
   * The native event associated with the custom event.
   */
  event: ReasonToEvent<Reason>
  /**
   * Cancels Base UI from handling the event.
   */
  cancel: () => void
  /**
   * Allows the event to propagate in cases where Base UI will stop the propagation.
   */
  allowPropagation: () => void
  /**
   * Indicates whether the event has been canceled.
   */
  isCanceled: boolean
  /**
   * Indicates whether the event is allowed to propagate.
   */
  isPropagationAllowed: boolean
  /**
   * The element that triggered the event, if applicable.
   */
  trigger: Element | undefined
} & CustomProperties

export type BaseUIChangeEventDetails<Reason extends string, CustomProperties extends object = Record<string, never>> = Reason extends string ? BaseUIChangeEventDetail<Reason, CustomProperties> : never

/**
 * Creates a Base UI event details object with the given reason and utilities
 * for preventing Base UI's internal event handling.
 */
export function createChangeEventDetails<
  Reason extends string,
  CustomProperties extends Record<string, unknown> = Record<string, never>,
>(
  reason: Reason,
  event?: ReasonToEvent<Reason>,
  trigger?: HTMLElement,
  customProperties?: CustomProperties,
): BaseUIChangeEventDetails<Reason> & CustomProperties {
  let canceled = false
  let propagationAllowed = false
  const custom = customProperties ?? (EMPTY_OBJECT as CustomProperties)

  const details = {
    reason,
    event: event ?? new Event('base-ui'),
    cancel() {
      canceled = true
    },
    allowPropagation() {
      propagationAllowed = true
    },
    get isCanceled() {
      return canceled
    },
    get isPropagationAllowed() {
      return propagationAllowed
    },
    trigger,
    ...custom,
  } as BaseUIChangeEventDetails<Reason> & CustomProperties

  return details
}
