<script setup lang="ts">
import type { TooltipProviderProps } from '../tooltip.types'
import { computed, provide, shallowRef, toRef } from 'vue'
import { OPEN_DELAY } from '../utils/constants'
import { tooltipProviderContextKey } from './TooltipProviderContext'

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

<template>
  <slot />
</template>
