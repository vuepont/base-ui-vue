import { EMPTY_OBJECT } from './empty'

export interface BaseUIChangeEventDetail<Reason extends string> {
  reason: Reason
  event: Event
  cancel: () => void
  allowPropagation: () => void
  isCanceled: boolean
  isPropagationAllowed: boolean
  trigger: Element | undefined
}

export type BaseUIChangeEventDetails<Reason extends string> = BaseUIChangeEventDetail<Reason>

/**
 * Creates a Base UI event details object with the given reason and utilities
 * for preventing Base UI's internal event handling.
 */
export function createChangeEventDetails<
  Reason extends string,
  CustomProperties extends Record<string, unknown> = Record<string, never>,
>(
  reason: Reason,
  event?: Event,
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
