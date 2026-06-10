<script setup lang="ts">
import {
  createTooltipHandle,
  TooltipArrow,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'base-ui-vue'
import { ref } from 'vue'

const tooltip = createTooltipHandle()
const open = ref(false)
const triggerId = ref<string | null>(null)

function handleOpenChange(nextOpen: boolean, details: any) {
  open.value = nextOpen
  triggerId.value = details.trigger?.id ?? null
}

function openTimerTrigger() {
  triggerId.value = 'timer-trigger'
  open.value = true
}
</script>

<template>
  <TooltipProvider>
    <div class="Container">
      <div class="ButtonGroup">
        <TooltipTrigger id="audio-trigger" :handle="tooltip" class="IconButton" aria-label="Controlled tooltip">
          <svg class="Icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" d="M1.5 11V7.5c0-2.5 2.5-6 6.5-6s6.5 3.5 6.5 6V11" />
            <path d="M12 7.5c1.3807 0 2.5 1.11929 2.5 2.5v2c0 1.3807-1.1193 2.5-2.5 2.5h-1.5v-7zm-8 0h1.5v7H4c-1.38071 0-2.5-1.1193-2.5-2.5v-2c0-1.38071 1.11929-2.5 2.5-2.5Z" />
          </svg>
        </TooltipTrigger>
        <TooltipTrigger id="timer-trigger" :handle="tooltip" class="IconButton" aria-label="Controlled tooltip">
          <svg class="Icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
            <circle cx="8" cy="8.5" r="6" />
            <path stroke-linecap="square" stroke-linejoin="round" d="M8 9.5v-5m0-2v-2m-2 0h4M12 4l1.5-1.5" />
          </svg>
        </TooltipTrigger>
      </div>

      <button type="button" class="ActionButton" @click="openTimerTrigger">
        Open programmatically
      </button>
    </div>

    <TooltipRoot
      :handle="tooltip"
      :open="open"
      :trigger-id="triggerId"
      @open-change="handleOpenChange"
    >
      <TooltipPortal>
        <TooltipPositioner :side-offset="11">
          <TooltipPopup class="Popup">
            <TooltipArrow class="Arrow" />
            Controlled tooltip
          </TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style src="./styles.css"></style>
