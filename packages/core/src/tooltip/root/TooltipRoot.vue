<script setup lang="ts" generic="Payload = unknown">
import type { BaseUIChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import type { REASONS as TooltipReasons } from '../../utils/reasons'
import type { BaseUIComponentProps } from '../../utils/types'
import type { TooltipHandle } from '../store/TooltipHandle'
import type { TooltipRootContext } from './TooltipRootContext'
import { computed, getCurrentInstance, onScopeDispose, provide, shallowRef, toRef, watch } from 'vue'
import { createFloatingRootContext } from '../../floating-ui-vue/components/FloatingRootStore'
import { REASONS } from '../../utils/reasons'
import { useControllableState } from '../../utils/useControllableState'
import { useTimeout } from '../../utils/useTimeout'
import { useTransitionStatus } from '../../utils/useTransitionStatus'
import { useTooltipProviderContext } from '../provider/TooltipProviderContext'
import { createTooltipChangeEventDetails, TooltipStore } from '../store/TooltipHandle'
import { OPEN_DELAY } from '../utils/constants'
import { tooltipRootContextKey } from './TooltipRootContext'

defineOptions({
  name: 'TooltipRoot',
})

const props = withDefaults(defineProps<TooltipRootProps<Payload>>(), {
  defaultOpen: false,
  disableHoverablePopup: false,
  trackCursorAxis: 'none',
  disabled: false,
  defaultTriggerId: null,
})

const emit = defineEmits<{
  (e: 'openChange', open: boolean, details: TooltipRootChangeEventDetails): void
  (e: 'openChangeComplete', open: boolean): void
}>()

const instance = getCurrentInstance()

const isOpenControlled = computed(() => {
  const vnodeProps = instance?.vnode.props as Record<string, unknown> | null | undefined
  return Boolean(vnodeProps && 'open' in vnodeProps)
})

const isTriggerIdControlled = computed(() => {
  const vnodeProps = instance?.vnode.props as Record<string, unknown> | null | undefined
  return Boolean(vnodeProps && ('triggerId' in vnodeProps || 'trigger-id' in vnodeProps))
})

const localStore = new TooltipStore<Payload>()
const store = props.handle?.store ?? localStore

const provider = useTooltipProviderContext()
const closeTimer = useTimeout()

const uncontrolledTriggerId = shallowRef<string | null>(props.defaultTriggerId ?? null)
const activeTriggerId = computed({
  get() {
    return isTriggerIdControlled.value ? props.triggerId ?? null : uncontrolledTriggerId.value
  },
  set(next: string | null) {
    if (!isTriggerIdControlled.value) {
      uncontrolledTriggerId.value = next
    }
  },
})

const { value: openState, setValue: setOpenState } = useControllableState<boolean>({
  controlled: () => (isOpenControlled.value ? props.open : undefined),
  default: () => props.defaultOpen ?? false,
  name: 'TooltipRoot',
  state: 'open',
})

const disabled = toRef(props, 'disabled')
const disableHoverablePopup = toRef(props, 'disableHoverablePopup')
const trackCursorAxis = toRef(props, 'trackCursorAxis')
const open = computed(() => !disabled.value && openState.value)
const hasViewport = shallowRef(false)

const { mounted, setMounted, transitionStatus } = useTransitionStatus(open, true, true)

const instantType = shallowRef<TooltipInstantType>(undefined)
const preventUnmountOnClose = shallowRef(false)

const popupId = shallowRef<string | undefined>(undefined)
const popupRef = shallowRef<HTMLElement | null>(null)
const positionerRef = shallowRef<HTMLElement | null>(null)
const popupWidth = shallowRef<number | undefined>(undefined)
const popupHeight = shallowRef<number | undefined>(undefined)

const activeTrigger = computed(() =>
  store.getTrigger(activeTriggerId.value) as ReturnType<typeof store.getTrigger>,
)
const payload = computed(() => activeTrigger.value?.payload as Payload | undefined)

function getOpenDelay(triggerDelay: number | undefined) {
  return provider?.getOpenDelay(triggerDelay) ?? {
    delay: triggerDelay ?? OPEN_DELAY,
    instant: false,
  }
}

function getCloseDelay(triggerCloseDelay: number | undefined) {
  return provider?.getCloseDelay(triggerCloseDelay) ?? triggerCloseDelay ?? 0
}

function requestOpenChange(
  nextOpen: boolean,
  details: TooltipRootChangeEventDetails,
  triggerId?: string | null,
) {
  if (nextOpen && disabled.value) {
    return
  }

  const nextTriggerId = triggerId === undefined ? activeTriggerId.value : triggerId
  const triggerChanged = nextTriggerId !== activeTriggerId.value

  if (nextOpen === openState.value && !triggerChanged) {
    return
  }

  preventUnmountOnClose.value = false
  details.preventUnmountOnClose = () => {
    preventUnmountOnClose.value = true
  }

  emit('openChange', nextOpen, details)

  if (details.isCanceled) {
    return
  }

  floatingRootContext.dispatchOpenChange(nextOpen, details)

  if (triggerId !== undefined) {
    activeTriggerId.value = triggerId
  }

  if (nextOpen) {
    provider?.notifyOpen()

    if (!mounted.value) {
      setMounted(true)
    }

    if (details.reason === REASONS.triggerFocus) {
      instantType.value = 'focus'
    }
    else if (details.reason !== REASONS.triggerHover) {
      instantType.value = undefined
    }
  }
  else {
    provider?.notifyClose()

    if (details.reason === REASONS.triggerPress || details.reason === REASONS.escapeKey) {
      instantType.value = 'dismiss'
    }
    else {
      instantType.value = undefined
    }
  }

  setOpenState(nextOpen)
}

function scheduleClose(
  delay: number,
  details: TooltipRootChangeEventDetails,
  triggerId?: string | null,
) {
  closeTimer.clear()

  if (delay <= 0) {
    requestOpenChange(false, details, triggerId)
    return
  }

  closeTimer.start(delay, () => {
    requestOpenChange(false, details, triggerId)
  })
}

function forceUnmount() {
  closeTimer.clear()
  setMounted(false)
  preventUnmountOnClose.value = false
}

function completeOpenChange() {
  emit('openChangeComplete', open.value)

  if (!open.value && !preventUnmountOnClose.value) {
    setMounted(false)
  }

  if (!open.value) {
    preventUnmountOnClose.value = false
  }
}

function close() {
  requestOpenChange(
    false,
    createTooltipChangeEventDetails(REASONS.imperativeAction),
  )
}

function maybeActivateTrigger(id: string) {
  if (open.value && activeTriggerId.value == null) {
    activeTriggerId.value = id
  }
}

watch(disabled, (isDisabled) => {
  if (isDisabled && openState.value) {
    requestOpenChange(
      false,
      createTooltipChangeEventDetails(REASONS.disabled),
    )
  }
})

watch(open, (isOpen) => {
  if (isOpen && mounted.value === false) {
    setMounted(true)
  }
})

store.controller.value = {
  open,
  activeTriggerId,
  disabled,
  disableHoverablePopup,
  trackCursorAxis,
  instantType,
  popupId,
  requestOpenChange,
  getOpenDelay,
  getCloseDelay,
  scheduleClose,
  clearCloseTimer: closeTimer.clear,
  forceUnmount,
  maybeActivateTrigger,
}

onScopeDispose(() => {
  if (store.controller.value?.requestOpenChange === requestOpenChange) {
    store.controller.value = null
  }
})

const floatingRootContext = createFloatingRootContext({
  open,
  transitionStatus,
  domReferenceElement: () => activeTrigger.value?.element ?? null,
  referenceElement: () => activeTrigger.value?.element ?? null,
  floatingElement: () => popupRef.value,
  floatingId: () => popupId.value,
  triggerElements: store.triggerElements,
  clearCloseTimer: closeTimer.clear,
  onOpenChange(nextOpen, details) {
    requestOpenChange(
      nextOpen,
      details as TooltipRootChangeEventDetails,
    )
  },
})

const context: TooltipRootContext<Payload> = {
  store,
  floatingRootContext,
  open,
  mounted,
  transitionStatus,
  disabled,
  disableHoverablePopup,
  trackCursorAxis,
  hasViewport,
  instantType,
  activeTriggerId,
  activeTrigger,
  payload,
  popupId,
  popupRef,
  positionerRef,
  popupWidth,
  popupHeight,
  requestOpenChange,
  getOpenDelay,
  getCloseDelay,
  scheduleClose,
  clearCloseTimer: closeTimer.clear,
  completeOpenChange,
  setMounted,
  setPopupId(id: string | undefined) {
    popupId.value = id
  },
  setHasViewport(next: boolean) {
    hasViewport.value = next
  },
}

provide(tooltipRootContextKey, context)

defineExpose<TooltipRootActions>({
  close,
  unmount: forceUnmount,
})
</script>

<script lang="ts">
export type TooltipInstantType = 'delay' | 'dismiss' | 'focus' | undefined
export type TooltipTrackCursorAxis = 'none' | 'x' | 'y' | 'both'

export interface TooltipRootState {}

export interface TooltipRootProps<Payload = unknown>
  extends BaseUIComponentProps<TooltipRootState> {
  /**
   * Whether the tooltip is initially open.
   *
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
   * A handle to associate the tooltip with a trigger.
   * If specified, allows external triggers to control the tooltip's open state.
   * Can be created with the `createTooltipHandle()` function.
   */
  handle?: TooltipHandle<Payload>
  /**
   * ID of the trigger that the tooltip is associated with.
   * This is useful in conjunction with the `open` prop to create a controlled tooltip.
   * There's no need to specify this prop when the tooltip is uncontrolled (that is, when the `open` prop is not set).
   */
  triggerId?: string | null
  /**
   * ID of the trigger that the tooltip is associated with.
   * This is useful in conjunction with the `defaultOpen` prop to create an initially open tooltip.
   */
  defaultTriggerId?: string | null
}

export interface TooltipRootActions {
  unmount: () => void
  close: () => void
}

export type TooltipRootChangeEventReason
  = | typeof TooltipReasons.triggerHover
    | typeof TooltipReasons.triggerFocus
    | typeof TooltipReasons.triggerPress
    | typeof TooltipReasons.outsidePress
    | typeof TooltipReasons.escapeKey
    | typeof TooltipReasons.disabled
    | typeof TooltipReasons.imperativeAction
    | typeof TooltipReasons.none

export type TooltipRootChangeEventDetails
  = BaseUIChangeEventDetails<TooltipRootChangeEventReason, {
    preventUnmountOnClose: () => void
  }>
</script>

<template>
  <slot :payload="payload" :state="{ open }" />
</template>
