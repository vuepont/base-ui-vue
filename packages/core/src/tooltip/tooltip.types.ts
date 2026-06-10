import type {
  Boundary,
  Padding,
  Placement,
  Strategy,
  VirtualElement,
} from '@floating-ui/vue'
import type { BaseUIChangeEventDetails } from '../utils/createBaseUIEventDetails'
import type { REASONS } from '../utils/reasons'
import type { BaseUIComponentProps, NativeButtonProps } from '../utils/types'
import type { TransitionStatus } from '../utils/useTransitionStatus'
import type { TooltipHandle } from './store/TooltipHandle'

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'
export type TooltipAlign = 'start' | 'center' | 'end'
export type TooltipInstantType = 'delay' | 'dismiss' | 'focus' | 'tracking-cursor' | undefined
export type TooltipTrackCursorAxis = 'none' | 'x' | 'y' | 'both'

export interface TooltipRootState {}

export type TooltipRootChangeEventReason
  = | typeof REASONS.triggerHover
    | typeof REASONS.triggerFocus
    | typeof REASONS.triggerPress
    | typeof REASONS.outsidePress
    | typeof REASONS.escapeKey
    | typeof REASONS.disabled
    | typeof REASONS.imperativeAction
    | typeof REASONS.none

export type TooltipRootChangeEventDetails
  = BaseUIChangeEventDetails<TooltipRootChangeEventReason, {
    preventUnmountOnClose: () => void
  }>

export interface TooltipRootActions {
  close: () => void
  unmount: () => void
}

export interface TooltipRootProps<Payload = unknown>
  extends BaseUIComponentProps<TooltipRootState> {
  /**
   * Whether the tooltip is initially open.
   * To render a controlled tooltip, use the `open` prop instead.
   * @default false
   */
  defaultOpen?: boolean
  /**
   * Whether the tooltip is currently open.
   */
  open?: boolean
  /**
   * Whether the tooltip contents can be hovered without closing the tooltip.
   * @default false
   */
  disableHoverablePopup?: boolean
  /**
   * Determines which axis the tooltip should track the cursor on.
   * @default 'none'
   */
  trackCursorAxis?: TooltipTrackCursorAxis
  /**
   * Whether the tooltip is disabled.
   * @default false
   */
  disabled?: boolean
  /**
   * A handle to associate the tooltip with detached triggers.
   */
  handle?: TooltipHandle<Payload>
  /**
   * ID of the trigger that the tooltip is associated with in controlled mode.
   */
  triggerId?: string | null
  /**
   * ID of the trigger that the tooltip is associated with when initially open.
   */
  defaultTriggerId?: string | null
}

export interface TooltipProviderProps {
  /**
   * How long to wait before opening a tooltip, in milliseconds.
   */
  delay?: number
  /**
   * How long to wait before closing a tooltip, in milliseconds.
   */
  closeDelay?: number
  /**
   * Another tooltip opens instantly if the previous tooltip closed within this timeout.
   * @default 400
   */
  timeout?: number
}

export interface TooltipTriggerState {
  /**
   * Whether the tooltip associated with this trigger is open.
   */
  open: boolean
  /**
   * Whether this trigger should ignore interaction.
   */
  disabled: boolean
}

export interface TooltipTriggerProps<Payload = unknown>
  extends NativeButtonProps, BaseUIComponentProps<TooltipTriggerState> {
  /**
   * A handle to associate this trigger with a tooltip.
   */
  handle?: TooltipHandle<Payload>
  /**
   * A payload exposed to the root scoped slot when this trigger opens the tooltip.
   */
  payload?: Payload
  /**
   * How long to wait before opening the tooltip, in milliseconds.
   * @default 600
   */
  delay?: number
  /**
   * Whether the tooltip should close when this trigger is clicked.
   * @default true
   */
  closeOnClick?: boolean
  /**
   * How long to wait before closing the tooltip, in milliseconds.
   * @default 0
   */
  closeDelay?: number
  /**
   * If true, the tooltip will not open when interacting with this trigger.
   * This does not apply the native `disabled` attribute.
   * @default false
   */
  disabled?: boolean
  /**
   * The trigger id.
   */
  id?: string
}

export interface TooltipPortalProps {
  /**
   * Whether to keep the portal mounted while the tooltip is hidden.
   * @default false
   */
  keepMounted?: boolean
  /**
   * Teleport target.
   * @default 'body'
   */
  to?: string | HTMLElement
  /**
   * Disables Vue Teleport while preserving tooltip mounting behavior.
   * @default false
   */
  disabled?: boolean
}

export interface TooltipPositionerState {
  open: boolean
  side: TooltipSide
  align: TooltipAlign
  anchorHidden: boolean
  instant: TooltipInstantType
}

export interface TooltipPositionerProps
  extends BaseUIComponentProps<TooltipPositionerState> {
  anchor?: HTMLElement | VirtualElement | null
  positionMethod?: Strategy
  side?: TooltipSide
  align?: TooltipAlign
  sideOffset?: number
  alignOffset?: number
  collisionBoundary?: Boundary
  collisionPadding?: Padding
  arrowPadding?: Padding
  sticky?: boolean
  disableAnchorTracking?: boolean
}

export interface TooltipPopupState {
  open: boolean
  side: TooltipSide
  align: TooltipAlign
  instant: TooltipInstantType
  transitionStatus: TransitionStatus
}

export interface TooltipPopupProps extends BaseUIComponentProps<TooltipPopupState> {
  id?: string
}

export interface TooltipArrowState {
  open: boolean
  side: TooltipSide
  align: TooltipAlign
  uncentered: boolean
  instant: TooltipInstantType
}

export interface TooltipArrowProps extends BaseUIComponentProps<TooltipArrowState> {}

export interface TooltipViewportState {
  activationDirection: 'left' | 'right' | 'up' | 'down' | undefined
  transitioning: boolean
  instant: TooltipInstantType
}

export interface TooltipViewportProps extends BaseUIComponentProps<TooltipViewportState> {}

export type TooltipFloatingPlacement = Placement
