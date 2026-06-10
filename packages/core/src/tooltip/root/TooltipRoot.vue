<script setup lang="ts" generic="Payload = unknown">
import type {
  TooltipInstantType,
  TooltipRootActions,
  TooltipRootChangeEventDetails,
  TooltipRootProps,
} from '../tooltip.types'
import type { TooltipRootContext } from './TooltipRootContext'
import { computed, getCurrentInstance, onScopeDispose, provide, shallowRef, toRef, watch } from 'vue'
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

const { mounted, setMounted, transitionStatus } = useTransitionStatus(open, true, true)

const instantType = shallowRef<TooltipInstantType>(undefined)
const preventUnmountOnClose = shallowRef(false)

const popupId = shallowRef<string | undefined>(undefined)
const popupRef = shallowRef<HTMLElement | null>(null)
const positionerRef = shallowRef<HTMLElement | null>(null)
const arrowRef = shallowRef<HTMLElement | null>(null)

const side = shallowRef<'top' | 'right' | 'bottom' | 'left'>('top')
const align = shallowRef<'start' | 'center' | 'end'>('center')
const anchorHidden = shallowRef(false)
const arrowX = shallowRef<number | undefined>(undefined)
const arrowY = shallowRef<number | undefined>(undefined)
const arrowUncentered = shallowRef(false)

const positionerWidth = shallowRef<number | undefined>(undefined)
const positionerHeight = shallowRef<number | undefined>(undefined)
const availableWidth = shallowRef<number | undefined>(undefined)
const availableHeight = shallowRef<number | undefined>(undefined)
const anchorWidth = shallowRef<number | undefined>(undefined)
const anchorHeight = shallowRef<number | undefined>(undefined)
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
    else if (instantType.value !== 'delay' && trackCursorAxis.value !== 'none') {
      instantType.value = 'tracking-cursor'
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

const context: TooltipRootContext<Payload> = {
  store,
  open,
  mounted,
  transitionStatus,
  disabled,
  disableHoverablePopup,
  trackCursorAxis,
  instantType,
  activeTriggerId,
  activeTrigger,
  payload,
  popupId,
  popupRef,
  positionerRef,
  arrowRef,
  side,
  align,
  anchorHidden,
  arrowX,
  arrowY,
  arrowUncentered,
  positionerWidth,
  positionerHeight,
  availableWidth,
  availableHeight,
  anchorWidth,
  anchorHeight,
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
  setPositionerSize(size: {
    width?: number
    height?: number
    availableWidth?: number
    availableHeight?: number
    anchorWidth?: number
    anchorHeight?: number
  }) {
    positionerWidth.value = size.width
    positionerHeight.value = size.height
    availableWidth.value = size.availableWidth
    availableHeight.value = size.availableHeight
    anchorWidth.value = size.anchorWidth
    anchorHeight.value = size.anchorHeight
  },
}

provide(tooltipRootContextKey, context)

defineExpose<TooltipRootActions>({
  close,
  unmount: forceUnmount,
})
</script>

<template>
  <slot :payload="payload" :state="{ open }" />
</template>
