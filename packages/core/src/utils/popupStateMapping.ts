import type { StateAttributesMapping } from './getStateAttributesProps'

export enum CommonPopupDataAttributes {
  /**
   * Present when the popup is open.
   */
  open = 'data-open',
  /**
   * Present when the popup is closed.
   */
  closed = 'data-closed',
  /**
   * Present when the popup is animating in.
   */
  startingStyle = 'data-starting-style',
  /**
   * Present when the popup is animating out.
   */
  endingStyle = 'data-ending-style',
  /**
   * Present when the anchor is hidden.
   */
  anchorHidden = 'data-anchor-hidden',
  /**
   * Indicates which side the popup is positioned relative to the trigger.
   */
  side = 'data-side',
  /**
   * Indicates how the popup is aligned relative to the specified side.
   */
  align = 'data-align',
}

export enum CommonTriggerDataAttributes {
  /**
   * Present when the popup is open.
   */
  popupOpen = 'data-popup-open',
  /**
   * Present when the trigger is disabled.
   */
  triggerDisabled = 'data-trigger-disabled',
}

const POPUP_OPEN_HOOK = {
  [CommonPopupDataAttributes.open]: '',
}

const POPUP_CLOSED_HOOK = {
  [CommonPopupDataAttributes.closed]: '',
}

const ANCHOR_HIDDEN_HOOK = {
  [CommonPopupDataAttributes.anchorHidden]: '',
}

const TRIGGER_OPEN_HOOK = {
  [CommonTriggerDataAttributes.popupOpen]: '',
}

const TRIGGER_DISABLED_HOOK = {
  [CommonTriggerDataAttributes.triggerDisabled]: '',
}

export const popupStateMapping = {
  open(value) {
    return value ? POPUP_OPEN_HOOK : POPUP_CLOSED_HOOK
  },
  anchorHidden(value) {
    return value ? ANCHOR_HIDDEN_HOOK : null
  },
  side(value) {
    return value ? { [CommonPopupDataAttributes.side]: value } : null
  },
  align(value) {
    return value ? { [CommonPopupDataAttributes.align]: value } : null
  },
  instant(value) {
    return value ? { 'data-instant': value } : null
  },
} satisfies StateAttributesMapping<{
  open: boolean
  anchorHidden?: boolean
  side?: string
  align?: string
  instant?: string
}>

export const triggerStateMapping = {
  open(value) {
    return value ? TRIGGER_OPEN_HOOK : null
  },
  disabled(value) {
    return value ? TRIGGER_DISABLED_HOOK : null
  },
} satisfies StateAttributesMapping<{
  open: boolean
  disabled: boolean
}>
