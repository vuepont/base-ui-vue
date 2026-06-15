<script setup lang="ts">
import { computed, provide, shallowRef, toRef } from 'vue'
import { OPEN_DELAY } from '../utils/constants'
import { tooltipProviderContextKey } from './TooltipProviderContext'

/**
 * Provides a shared delay for multiple tooltips. The grouping logic ensures that
 * once a tooltip becomes visible, the adjacent tooltips will be shown instantly.
 *
 * Documentation: [Base UI Vue Tooltip](https://baseui-vue.com/docs/components/tooltip)
 */
defineOptions({
  name: 'TooltipProvider',
})

const props = withDefaults(defineProps<TooltipProviderProps>(), {
  timeout: 400,
})

const lastCloseTime = shallowRef<number | null>(null)

const delay = toRef(props, 'delay')
const closeDelay = toRef(props, 'closeDelay')
const timeout = computed(() => props.timeout)

provide(tooltipProviderContextKey, {
  delay,
  closeDelay,
  timeout,
  getOpenDelay(triggerDelay) {
    const now = Date.now()
    const instant = lastCloseTime.value != null && now - lastCloseTime.value <= timeout.value

    if (instant) {
      return { delay: 0, instant: true }
    }

    return {
      delay: triggerDelay ?? delay.value ?? OPEN_DELAY,
      instant: false,
    }
  },
  getCloseDelay(triggerCloseDelay) {
    return triggerCloseDelay ?? closeDelay.value ?? 0
  },
  notifyOpen() {
    lastCloseTime.value = null
  },
  notifyClose() {
    lastCloseTime.value = Date.now()
  },
})
</script>

<script lang="ts">
export interface TooltipProviderState {}

export interface TooltipProviderProps {
  /**
   * How long to wait before opening a tooltip. Specified in milliseconds.
   */
  delay?: number
  /**
   * How long to wait before closing a tooltip. Specified in milliseconds.
   */
  closeDelay?: number
  /**
   * Another tooltip will open instantly if the previous tooltip
   * is closed within this timeout. Specified in milliseconds.
   * @default 400
   */
  timeout?: number
}
</script>

<template>
  <slot />
</template>
