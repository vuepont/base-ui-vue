import type { BaseUIChangeEventDetails } from '../utils/createBaseUIEventDetails'
import type { REASONS } from '../utils/reasons'
import type { BaseUIComponentProps, NativeButtonProps } from '../utils/types'
import type { TransitionStatus } from '../utils/useTransitionStatus'

export type { TransitionStatus }

export interface CollapsibleRootState {
  open: boolean
  disabled: boolean
  transitionStatus: TransitionStatus
}

export type CollapsibleChangeEventReason = typeof REASONS.triggerPress | typeof REASONS.none
export type CollapsibleChangeEventDetails = BaseUIChangeEventDetails<CollapsibleChangeEventReason>

export interface CollapsibleRootProps extends BaseUIComponentProps<CollapsibleRootState> {
  /**
   * Whether the collapsible panel is currently open (controlled).
   */
  open?: boolean
  /**
   * Whether the collapsible panel is initially open (uncontrolled).
   * @default false
   */
  defaultOpen?: boolean
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean
}

export interface CollapsibleTriggerProps
  extends NativeButtonProps, BaseUIComponentProps<CollapsibleRootState> {
  /**
   * Whether the trigger should ignore user interaction.
   * When undefined, inherits from CollapsibleRoot.
   */
  disabled?: boolean
}

export interface CollapsiblePanelState extends CollapsibleRootState {
  transitionStatus: TransitionStatus
}

export interface CollapsiblePanelProps extends BaseUIComponentProps<CollapsiblePanelState> {
  /**
   * The `id` attribute of the panel element.
   * When set, overrides the auto-generated panel id.
   */
  id?: string
  /**
   * Whether to keep the element in the DOM while the panel is hidden.
   * @default false
   */
  keepMounted?: boolean
  /**
   * Allows the browser's built-in page search to find and expand the panel contents.
   * Overrides the `keepMounted` prop and uses `hidden="until-found"`.
   * @default false
   */
  hiddenUntilFound?: boolean
}
