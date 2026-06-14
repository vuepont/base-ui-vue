<script setup lang="ts">
import {
  TooltipArrow,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'base-ui-vue'

const triggerClass = 'flex size-8 items-center justify-center border-0 bg-transparent text-sm font-bold leading-none text-gray-900 select-none data-popup-open:bg-gray-100 hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue dark:text-gray-900'
const popupClass = 'relative flex flex-col border border-gray-900 bg-gray-50 px-2 py-1 text-sm leading-5 text-gray-900 origin-(--transform-origin) shadow-[0.25rem_0.25rem_0] shadow-black/12 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-instant:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0'
const arrowClass = 'block h-1.5 w-3 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:border before:border-gray-900 before:bg-gray-50 before:content-[\'\'] before:[transform:translate(-50%,50%)_rotate(45deg)]'
</script>

<template>
  <TooltipProvider>
    <div class="flex border border-gray-900 bg-gray-50" aria-label="Formatting controls">
      <TooltipRoot>
        <TooltipTrigger :class="triggerClass" aria-label="Bold">
          <span aria-hidden="true">B</span>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipPositioner :side-offset="11">
            <TooltipPopup :class="popupClass">
              <TooltipArrow :class="arrowClass" />
              Bold
            </TooltipPopup>
          </TooltipPositioner>
        </TooltipPortal>
      </TooltipRoot>

      <TooltipRoot>
        <TooltipTrigger :class="triggerClass" aria-label="Italic">
          <span aria-hidden="true" class="italic">I</span>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipPositioner :side-offset="11">
            <TooltipPopup :class="popupClass">
              <TooltipArrow :class="arrowClass" />
              Italic
            </TooltipPopup>
          </TooltipPositioner>
        </TooltipPortal>
      </TooltipRoot>

      <TooltipRoot>
        <TooltipTrigger :class="triggerClass" aria-label="Underline">
          <span aria-hidden="true" class="underline underline-offset-2">U</span>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipPositioner :side-offset="11">
            <TooltipPopup :class="popupClass">
              <TooltipArrow :class="arrowClass" />
              Underline
            </TooltipPopup>
          </TooltipPositioner>
        </TooltipPortal>
      </TooltipRoot>
    </div>
  </TooltipProvider>
</template>
