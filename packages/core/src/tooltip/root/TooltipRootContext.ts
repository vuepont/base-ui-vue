import type {
  ComputedRef,
  InjectionKey,
  Ref,
  ShallowRef,
} from 'vue'
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import type { TooltipStore, TooltipTriggerRecord } from '../store/TooltipHandle'
import type {
  TooltipAlign,
  TooltipInstantType,
  TooltipRootChangeEventDetails,
  TooltipSide,
  TooltipTrackCursorAxis,
} from '../tooltip.types'
import { inject } from 'vue'

export interface TooltipRootContext<Payload = unknown> {
  store: TooltipStore<Payload>
  open: Readonly<Ref<boolean>>
  mounted: Ref<boolean>
  transitionStatus: Ref<TransitionStatus>
  disabled: Readonly<Ref<boolean>>
  disableHoverablePopup: Readonly<Ref<boolean>>
  trackCursorAxis: Readonly<Ref<TooltipTrackCursorAxis>>
  instantType: Ref<TooltipInstantType>
  activeTriggerId: Ref<string | null>
  activeTrigger: ComputedRef<TooltipTriggerRecord<Payload> | undefined>
  payload: ComputedRef<Payload | undefined>
  popupId: Ref<string | undefined>
  popupRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  arrowRef: Ref<HTMLElement | null>
  side: Ref<TooltipSide>
  align: Ref<TooltipAlign>
  anchorHidden: Ref<boolean>
  arrowX: ShallowRef<number | undefined>
  arrowY: ShallowRef<number | undefined>
  arrowUncentered: Ref<boolean>
  positionerWidth: ShallowRef<number | undefined>
  positionerHeight: ShallowRef<number | undefined>
  availableWidth: ShallowRef<number | undefined>
  availableHeight: ShallowRef<number | undefined>
  anchorWidth: ShallowRef<number | undefined>
  anchorHeight: ShallowRef<number | undefined>
  popupWidth: ShallowRef<number | undefined>
  popupHeight: ShallowRef<number | undefined>
  requestOpenChange: (
    nextOpen: boolean,
    details: TooltipRootChangeEventDetails,
    triggerId?: string | null,
  ) => void
  getOpenDelay: (triggerDelay: number | undefined) => { delay: number, instant: boolean }
  getCloseDelay: (triggerCloseDelay: number | undefined) => number
  scheduleClose: (
    delay: number,
    details: TooltipRootChangeEventDetails,
    triggerId?: string | null,
  ) => void
  clearCloseTimer: () => void
  completeOpenChange: () => void
  setMounted: (next: boolean) => void
  setPopupId: (id: string | undefined) => void
  setPositionerSize: (size: {
    width?: number
    height?: number
    availableWidth?: number
    availableHeight?: number
    anchorWidth?: number
    anchorHeight?: number
  }) => void
}

export const tooltipRootContextKey: InjectionKey<TooltipRootContext>
  = Symbol('TooltipRootContext')

export function useTooltipRootContext(optional?: false): TooltipRootContext
export function useTooltipRootContext(optional: true): TooltipRootContext | undefined
export function useTooltipRootContext(optional = false): TooltipRootContext | undefined {
  const context = inject(tooltipRootContextKey, undefined)

  if (context === undefined && !optional) {
    throw new Error(
      'Base UI Vue: TooltipRootContext is missing. Tooltip parts must be placed within <TooltipRoot> or receive a tooltip handle.',
    )
  }

  return context
}
