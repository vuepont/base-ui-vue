<script setup lang="ts" generic="Payload = unknown">
import type { TooltipRootChangeEventDetails, TooltipTriggerProps, TooltipTriggerState } from '../tooltip.types'
import { computed, shallowRef, useAttrs, watch } from 'vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { useButton } from '../../use-button'
import { REASONS } from '../../utils/reasons'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTimeout } from '../../utils/useTimeout'
import { useTooltipRootContext } from '../root/TooltipRootContext'
import { createTooltipChangeEventDetails } from '../store/TooltipHandle'
import { triggerStateMapping } from '../utils/popupStateMapping'

defineOptions({
  name: 'TooltipTrigger',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipTriggerProps<Payload>>(), {
  as: 'button',
  closeOnClick: true,
  disabled: false,
  nativeButton: true,
})

const attrs = useAttrs()
const injectedRootContext = useTooltipRootContext(true)
const store = props.handle?.store ?? injectedRootContext?.store

if (!store) {
  throw new Error(
    'Base UI Vue: <TooltipTrigger> must be used within a <TooltipRoot> component or receive a tooltip handle.',
  )
}

const triggerId = useBaseUiId(props.id)!
const triggerRef = shallowRef<HTMLElement | null>(null)
const openTimer = useTimeout()
const pointerType = shallowRef<string | undefined>(undefined)

const root = computed(() => store.controller.value)
const disabled = computed(() => props.disabled || root.value?.disabled.value || false)
const open = computed(() =>
  Boolean(root.value?.open.value && root.value?.activeTriggerId.value === triggerId),
)

const { getButtonProps, buttonRef } = useButton({
  disabled,
  focusableWhenDisabled: () => true,
  native: () => props.nativeButton ?? true,
})

const triggerState = computed<TooltipTriggerState>(() => ({
  open: open.value,
  disabled: disabled.value,
}))

function triggerElement() {
  return triggerRef.value ?? undefined
}

function makeDetails(
  reason: TooltipRootChangeEventDetails['reason'],
  event?: any,
) {
  return createTooltipChangeEventDetails(reason, event, triggerElement())
}

function requestOpen(event: MouseEvent | FocusEvent) {
  const context = root.value

  if (!context) {
    return
  }

  context.requestOpenChange(true, makeDetails(event.type === 'focus' ? REASONS.triggerFocus : REASONS.triggerHover, event), triggerId)
}

function requestClose(event: MouseEvent | FocusEvent | KeyboardEvent | PointerEvent) {
  const context = root.value

  if (!context) {
    return
  }

  const reason = event.type === 'keydown'
    ? REASONS.escapeKey
    : event.type === 'click' || event.type === 'pointerdown'
      ? REASONS.triggerPress
      : event.type === 'blur'
        ? REASONS.triggerFocus
        : REASONS.triggerHover

  context.requestOpenChange(false, makeDetails(reason, event), triggerId)
}

function handleMouseEnter(event: MouseEvent) {
  const context = root.value

  if (!context) {
    return
  }

  if (pointerType.value === 'touch') {
    return
  }

  context.clearCloseTimer()
  openTimer.clear()

  if (disabled.value) {
    if (context.open.value) {
      context.requestOpenChange(false, makeDetails(REASONS.triggerHover, event), triggerId)
    }
    return
  }

  const { delay, instant } = context.getOpenDelay(props.delay)

  if (instant) {
    context.instantType.value = 'delay'
  }

  if (delay <= 0) {
    requestOpen(event)
    return
  }

  openTimer.start(delay, () => {
    requestOpen(event)
  })
}

function handleMouseLeave(event: MouseEvent) {
  const context = root.value

  openTimer.clear()

  if (!context || context.activeTriggerId.value !== triggerId) {
    return
  }

  const delay = context.getCloseDelay(props.closeDelay)
  context.scheduleClose(delay, makeDetails(REASONS.triggerHover, event), triggerId)
}

function handleFocus(event: FocusEvent) {
  const context = root.value

  if (!context) {
    return
  }

  openTimer.clear()
  context.clearCloseTimer()

  if (disabled.value) {
    if (context.open.value) {
      context.requestOpenChange(false, makeDetails(REASONS.triggerFocus, event), triggerId)
    }
    return
  }

  requestOpen(event)
}

function handleBlur(event: FocusEvent) {
  openTimer.clear()
  requestClose(event)
}

function handlePointerDown(event: PointerEvent) {
  pointerType.value = event.pointerType

  if (props.closeOnClick && !open.value) {
    openTimer.clear()
  }
}

function handleClick(event: MouseEvent) {
  if (!props.closeOnClick) {
    return
  }

  openTimer.clear()

  if (open.value) {
    requestClose(event)
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && root.value?.open.value) {
    requestClose(event)
  }
}

watch(
  [
    triggerRef,
    () => props.payload,
    () => props.closeOnClick,
    () => props.closeDelay,
  ],
  ([element], _previous, onCleanup) => {
    if (!element) {
      return
    }

    store.registerTrigger({
      id: triggerId,
      element,
      payload: props.payload,
      closeOnClick: props.closeOnClick ?? true,
      closeDelay: props.closeDelay,
    })

    onCleanup(() => {
      store.unregisterTrigger(triggerId, element)
    })
  },
  { immediate: true },
)

const renderRef = useMergedRefs(buttonRef, triggerRef)

const triggerProps = computed(() =>
  getButtonProps(mergeProps(
    attrs as Record<string, any>,
    {
      'id': triggerId,
      'aria-describedby': open.value ? root.value?.popupId.value : undefined,
      'data-base-ui-tooltip-trigger': disabled.value ? undefined : '',
      onPointerenter(event: PointerEvent) {
        pointerType.value = event.pointerType
      },
      'onPointerdown': handlePointerDown,
      'onMouseenter': handleMouseEnter,
      'onMouseleave': handleMouseLeave,
      'onFocus': handleFocus,
      'onBlur': handleBlur,
      'onClick': handleClick,
      'onKeydown': handleKeydown,
    },
  )),
)

const {
  tag,
  mergedProps,
  renderless,
} = useRenderElement({
  componentProps: props,
  state: triggerState,
  props: triggerProps,
  stateAttributesMapping: triggerStateMapping,
  defaultTagName: 'button',
  ref: renderRef,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="triggerState" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="triggerState" />
  </component>
</template>
