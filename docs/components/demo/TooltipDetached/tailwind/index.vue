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

const tooltip = createTooltipHandle()
const iconButtonClass = 'flex size-8 items-center justify-center border border-gray-900 bg-gray-50 text-gray-900 select-none data-popup-open:bg-gray-100 hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue'
const popupClass = 'relative flex flex-col border border-gray-900 bg-gray-50 px-2 py-1 text-sm leading-5 text-gray-900 origin-(--transform-origin) shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-instant:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0'
const arrowClass = 'block h-1.5 w-3 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:border before:border-gray-900 before:bg-gray-50 before:content-[\'\'] before:[transform:translate(-50%,50%)_rotate(45deg)]'
</script>

<template>
  <TooltipProvider>
    <TooltipTrigger :handle="tooltip" :class="iconButtonClass" aria-label="Delete">
      <svg class="size-4" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linejoin="round" aria-hidden="true">
        <path stroke-linecap="square" d="M2.5 4h11" />
        <path stroke-linecap="round" d="M6.5 4V3c0-.82843.67157-1.5 1.5-1.5S9.5 2.17157 9.5 3v1" />
        <path stroke-linecap="square" d="m3.5 4 .87069 9.1422c.07332.7699.7199 1.3578 1.49324 1.3578h4.27217c.7733 0 1.4199-.5879 1.4932-1.3578L12.5 4" />
      </svg>
    </TooltipTrigger>

    <TooltipRoot :handle="tooltip">
      <TooltipPortal>
        <TooltipPositioner :side-offset="11">
          <TooltipPopup :class="popupClass">
            <TooltipArrow :class="arrowClass" />
            Delete
          </TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
