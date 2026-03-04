import type { BaseUIChangeEventDetails } from '../utils/createChangeEventDetails'
import type * as REASONS from '../utils/reasons'
import type { BaseUIComponentProps, NativeButtonProps, Orientation } from '../utils/types'
import type { TransitionStatus } from '../utils/useTransitionStatus'

export type AccordionValue<Value = any> = Value[]

export interface AccordionRootState<Value = any> {
  value: AccordionValue<Value>
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean
  orientation: Orientation
}

export interface AccordionRootProps<Value = any> extends BaseUIComponentProps<AccordionRootState<Value>> {
  /**
   * The controlled value of the item(s) that should be expanded.
   *
   * To render an uncontrolled accordion, use the `defaultValue` prop instead.
   */
  value?: AccordionValue<Value>
  /**
   * The uncontrolled value of the item(s) that should be initially expanded.
   *
   * To render a controlled accordion, use the `value` prop instead.
   */
  defaultValue?: AccordionValue<Value>
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean
  /**
   * Allows the browser's built-in page search to find and expand the panel contents.
   *
   * Overrides the `keepMounted` prop and uses `hidden="until-found"`
   * to hide the element without removing it from the DOM.
   * @default false
   */
  hiddenUntilFound?: boolean
  /**
   * Whether to keep the element in the DOM while the panel is closed.
   * This prop is ignored when `hiddenUntilFound` is used.
   * @default false
   */
  keepMounted?: boolean
  /**
   * Whether to loop keyboard focus back to the first item
   * when the end of the list is reached while using the arrow keys.
   * @default true
   */
  loopFocus?: boolean
  /**
   * Whether multiple items can be open at the same time.
   * @default false
   */
  multiple?: boolean
  /**
   * The visual orientation of the accordion.
   * Controls whether roving focus uses left/right or up/down arrow keys.
   * @default 'vertical'
   */
  orientation?: Orientation
}

export type AccordionRootChangeEventReason = typeof REASONS.triggerPress | typeof REASONS.none

export type AccordionRootChangeEventDetails = BaseUIChangeEventDetails<AccordionRootChangeEventReason>

export interface AccordionItemState<Value = any> extends AccordionRootState<Value> {
  index: number
  open: boolean
}

export interface AccordionItemProps extends BaseUIComponentProps<AccordionItemState> {
  /**
   * A unique value that identifies this accordion item.
   * If no value is provided, a unique ID will be generated automatically.
   */
  value?: any
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean
}

export type AccordionItemChangeEventReason = typeof REASONS.triggerPress | typeof REASONS.none

export type AccordionItemChangeEventDetails = BaseUIChangeEventDetails<AccordionItemChangeEventReason>

export interface AccordionHeaderProps extends BaseUIComponentProps<AccordionItemState> {}

export interface AccordionTriggerProps extends NativeButtonProps, BaseUIComponentProps<AccordionItemState> {
  /**
   * Whether the trigger should ignore user interaction.
   */
  disabled?: boolean
  /**
   * The id of the trigger element. When set, overrides the auto-generated trigger id.
   */
  id?: string
}

export interface AccordionPanelState extends AccordionItemState {
  transitionStatus: TransitionStatus
}

export interface AccordionPanelProps extends BaseUIComponentProps<AccordionPanelState> {
  /**
   * Allows the browser's built-in page search to find and expand the panel contents.
   * @default undefined
   */
  hiddenUntilFound?: boolean
  /**
   * Whether to keep the element in the DOM while the panel is closed.
   * @default undefined
   */
  keepMounted?: boolean
  /**
   * The id of the panel element.
   */
  id?: string
}
