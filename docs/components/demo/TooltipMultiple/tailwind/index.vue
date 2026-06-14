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
  TooltipViewport,
} from 'base-ui-vue'

const tooltip = createTooltipHandle<{ label: string }>()
const triggerClass = 'flex size-8 items-center justify-center border border-gray-900 bg-gray-50 text-gray-900 select-none data-popup-open:bg-gray-100 hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue'
const popupClass = 'relative flex flex-col border border-gray-900 bg-gray-50 px-2 py-1 text-sm leading-5 text-gray-900 origin-(--transform-origin) shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[width,scale,opacity] duration-[350ms,160ms,160ms] ease-out data-ending-style:scale-90 data-ending-style:opacity-0 data-instant:transition-none data-starting-style:scale-90 data-starting-style:opacity-0'
const arrowClass = 'block h-1.5 w-3 overflow-clip transition-[left] duration-[350ms] data-instant:transition-none data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:border before:border-gray-900 before:bg-gray-50 before:content-[\'\'] before:[transform:translate(-50%,50%)_rotate(45deg)]'
</script>

<template>
  <TooltipProvider>
    <div class="flex">
      <TooltipTrigger :handle="tooltip" :payload="{ label: 'Listen to audio preview' }" :class="triggerClass" aria-label="Listen to audio preview">
        <svg class="size-4" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" d="M1.5 11V7.5c0-2.5 2.5-6 6.5-6s6.5 3.5 6.5 6V11" />
          <path d="M12 7.5c1.3807 0 2.5 1.11929 2.5 2.5v2c0 1.3807-1.1193 2.5-2.5 2.5h-1.5v-7zm-8 0h1.5v7H4c-1.38071 0-2.5-1.1193-2.5-2.5v-2c0-1.38071 1.11929-2.5 2.5-2.5Z" />
        </svg>
      </TooltipTrigger>

      <TooltipTrigger :handle="tooltip" :payload="{ label: 'Set a timer' }" class="border-l-0" :class="[triggerClass]" aria-label="Set a timer">
        <svg class="size-4" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
          <circle cx="8" cy="8.5" r="6" />
          <path stroke-linecap="square" stroke-linejoin="round" d="M8 9.5v-5m0-2v-2m-2 0h4M12 4l1.5-1.5" />
        </svg>
      </TooltipTrigger>

      <TooltipTrigger :handle="tooltip" :payload="{ label: 'Delete: This action cannot be undone' }" class="border-l-0" :class="[triggerClass]" aria-label="Delete: This action cannot be undone">
        <svg class="size-4" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linejoin="round" aria-hidden="true">
          <path stroke-linecap="square" d="M2.5 4h11" />
          <path stroke-linecap="round" d="M6.5 4V3c0-.82843.67157-1.5 1.5-1.5S9.5 2.17157 9.5 3v1" />
          <path stroke-linecap="square" d="m3.5 4 .87069 9.1422c.07332.7699.7199 1.3578 1.49324 1.3578h4.27217c.7733 0 1.4199-.5879 1.4932-1.3578L12.5 4" />
        </svg>
      </TooltipTrigger>
    </div>

    <TooltipRoot v-slot="{ payload }" :handle="tooltip">
      <TooltipPortal>
        <TooltipPositioner
          :side-offset="11"
          class="h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none"
        >
          <TooltipPopup :class="popupClass">
            <TooltipArrow :class="arrowClass" />
            <TooltipViewport class="w-full overflow-clip data-[activation-direction=left]:[&_[data-current][data-starting-style]]:-translate-x-1/2 data-[activation-direction=left]:[&_[data-current][data-starting-style]]:opacity-0 data-[activation-direction=right]:[&_[data-current][data-starting-style]]:translate-x-1/2 data-[activation-direction=right]:[&_[data-current][data-starting-style]]:opacity-0 [&_[data-current]]:w-max [&_[data-current]]:max-w-[calc(min(24rem,var(--available-width))-1rem)] [&_[data-current]]:translate-x-0 [&_[data-current]]:opacity-100 [&_[data-current]]:transition-[translate,opacity] [&_[data-current]]:duration-[350ms,175ms] [&_[data-current]]:ease-[cubic-bezier(0.22,1,0.36,1)]">
              {{ payload ? payload.label : '' }}
            </TooltipViewport>
          </TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
