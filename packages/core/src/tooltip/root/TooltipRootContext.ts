import type {
  ComputedRef,
  InjectionKey,
  Ref,
  ShallowRef,
} from 'vue'
import type { FloatingRootContext } from '../../floating-ui-vue/types'
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import type { TooltipStore, TooltipTriggerRecord } from '../store/TooltipHandle'
import type {
  TooltipInstantType,
  TooltipRootChangeEventDetails,
  TooltipTrackCursorAxis,
} from './TooltipRoot.vue'
import { inject } from 'vue'

export interface TooltipRootContext<Payload = unknown> {
  store: TooltipStore<Payload>
  floatingRootContext: FloatingRootContext
  open: Readonly<Ref<boolean>>
  mounted: Ref<boolean>
  transitionStatus: Ref<TransitionStatus>
  disabled: Readonly<Ref<boolean>>
  disableHoverablePopup: Readonly<Ref<boolean>>
  trackCursorAxis: Readonly<Ref<TooltipTrackCursorAxis>>
  hasViewport: Ref<boolean>
  instantType: Ref<TooltipInstantType>
  activeTriggerId: Ref<string | null>
  activeTrigger: ComputedRef<TooltipTriggerRecord<Payload> | undefined>
  payload: ComputedRef<Payload | undefined>
  popupId: Ref<string | undefined>
  popupRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
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
  setHasViewport: (next: boolean) => void
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
