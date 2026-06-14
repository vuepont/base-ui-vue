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
import { shallowRef } from 'vue'

const tooltip = createTooltipHandle()
const open = shallowRef(false)
const triggerId = shallowRef<string | null>(null)

function handleOpenChange(nextOpen: boolean, details: any) {
  open.value = nextOpen
  triggerId.value = details.trigger?.id ?? null
}

function openTimerTrigger() {
  triggerId.value = 'trigger-2'
  open.value = true
}

const iconButtonClass = 'flex size-8 items-center justify-center border border-gray-900 bg-gray-50 text-gray-900 select-none data-popup-open:bg-gray-100 hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue'
const actionButtonClass = 'flex h-8 items-center justify-center border border-gray-900 bg-gray-50 px-3 text-sm leading-none whitespace-nowrap text-gray-900 select-none hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue'
const positionerClass = 'h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)]'
const popupClass = 'relative flex flex-col border border-gray-900 bg-gray-50 px-2 py-1 text-sm leading-5 text-gray-900 origin-[var(--transform-origin)] shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-instant:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0'
const arrowClass = 'block h-1.5 w-3 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:border before:border-gray-900 before:bg-gray-50 before:content-[\'\'] before:[transform:translate(-50%,50%)_rotate(45deg)]'
</script>

<template>
  <TooltipProvider>
    <div class="flex flex-wrap justify-center gap-2">
      <div class="flex">
        <TooltipTrigger id="trigger-1" :handle="tooltip" :class="iconButtonClass" aria-label="Trigger 1">
          <svg class="size-4" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" d="M1.5 11V7.5c0-2.5 2.5-6 6.5-6s6.5 3.5 6.5 6V11" />
            <path d="M12 7.5c1.3807 0 2.5 1.11929 2.5 2.5v2c0 1.3807-1.1193 2.5-2.5 2.5h-1.5v-7zm-8 0h1.5v7H4c-1.38071 0-2.5-1.1193-2.5-2.5v-2c0-1.38071 1.11929-2.5 2.5-2.5Z" />
          </svg>
        </TooltipTrigger>
        <TooltipTrigger id="trigger-2" :handle="tooltip" class="border-l-0" :class="[iconButtonClass]" aria-label="Trigger 2">
          <svg class="size-4" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
            <circle cx="8" cy="8.5" r="6" />
            <path stroke-linecap="square" stroke-linejoin="round" d="M8 9.5v-5m0-2v-2m-2 0h4M12 4l1.5-1.5" />
          </svg>
        </TooltipTrigger>
        <TooltipTrigger id="trigger-3" :handle="tooltip" class="border-l-0" :class="[iconButtonClass]" aria-label="Trigger 3">
          <svg class="size-4" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linejoin="round" aria-hidden="true">
            <path stroke-linecap="square" d="M2.5 4h11" />
            <path stroke-linecap="round" d="M6.5 4V3c0-.82843.67157-1.5 1.5-1.5S9.5 2.17157 9.5 3v1" />
            <path stroke-linecap="square" d="m3.5 4 .87069 9.1422c.07332.7699.7199 1.3578 1.49324 1.3578h4.27217c.7733 0 1.4199-.5879 1.4932-1.3578L12.5 4" />
          </svg>
        </TooltipTrigger>
      </div>

      <button type="button" :class="actionButtonClass" @click="openTimerTrigger">
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
        <TooltipPositioner :side-offset="11" :class="positionerClass">
          <TooltipPopup :class="popupClass">
            <TooltipArrow :class="arrowClass" />
            Controlled tooltip
          </TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
