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
</script>

<template>
  <TooltipProvider>
    <TooltipTrigger :handle="tooltip" class="IconButton" aria-label="Delete">
      <svg class="Icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linejoin="round" aria-hidden="true">
        <path stroke-linecap="square" d="M2.5 4h11" />
        <path stroke-linecap="round" d="M6.5 4V3c0-.82843.67157-1.5 1.5-1.5S9.5 2.17157 9.5 3v1" />
        <path stroke-linecap="square" d="m3.5 4 .87069 9.1422c.07332.7699.7199 1.3578 1.49324 1.3578h4.27217c.7733 0 1.4199-.5879 1.4932-1.3578L12.5 4" />
      </svg>
    </TooltipTrigger>

    <TooltipRoot :handle="tooltip">
      <TooltipPortal>
        <TooltipPositioner :side-offset="11">
          <TooltipPopup class="Popup">
            <TooltipArrow class="Arrow" />
            Delete
          </TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style src="./styles.css"></style>
