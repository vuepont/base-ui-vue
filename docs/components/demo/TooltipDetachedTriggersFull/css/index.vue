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

const demoTooltip = createTooltipHandle<string>()
</script>

<template>
  <TooltipProvider>
    <div class="ButtonGroup">
      <TooltipTrigger
        class="Button"
        :handle="demoTooltip"
        payload="Listen to audio preview"
        aria-label="Listen to audio preview"
      >
        <svg class="Icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" d="M1.5 11V7.5c0-2.5 2.5-6 6.5-6s6.5 3.5 6.5 6V11" />
          <path d="M12 7.5c1.3807 0 2.5 1.11929 2.5 2.5v2c0 1.3807-1.1193 2.5-2.5 2.5h-1.5v-7zm-8 0h1.5v7H4c-1.38071 0-2.5-1.1193-2.5-2.5v-2c0-1.38071 1.11929-2.5 2.5-2.5Z" />
        </svg>
      </TooltipTrigger>

      <TooltipTrigger
        class="Button"
        :handle="demoTooltip"
        payload="Set a timer"
        aria-label="Set a timer"
      >
        <svg class="Icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
          <circle cx="8" cy="8.5" r="6" />
          <path stroke-linecap="square" stroke-linejoin="round" d="M8 9.5v-5m0-2v-2m-2 0h4M12 4l1.5-1.5" />
        </svg>
      </TooltipTrigger>

      <TooltipTrigger
        class="Button"
        :handle="demoTooltip"
        payload="Delete: This action cannot be undone"
        aria-label="Delete: This action cannot be undone"
      >
        <svg class="Icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linejoin="round" aria-hidden="true">
          <path stroke-linecap="square" d="M2.5 4h11" />
          <path stroke-linecap="round" d="M6.5 4V3c0-.82843.67157-1.5 1.5-1.5S9.5 2.17157 9.5 3v1" />
          <path stroke-linecap="square" d="m3.5 4 .87069 9.1422c.07332.7699.7199 1.3578 1.49324 1.3578h4.27217c.7733 0 1.4199-.5879 1.4932-1.3578L12.5 4" />
        </svg>
      </TooltipTrigger>
    </div>

    <TooltipRoot v-slot="{ payload }" :handle="demoTooltip">
      <TooltipPortal>
        <TooltipPositioner :side-offset="11" class="Positioner">
          <TooltipPopup class="Popup">
            <TooltipArrow class="Arrow" />

            <TooltipViewport class="Viewport">
              {{ payload }}
            </TooltipViewport>
          </TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style src="./styles.css"></style>
