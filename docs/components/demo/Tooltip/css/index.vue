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
</script>

<template>
  <TooltipProvider>
    <div class="Panel" aria-label="Formatting controls">
      <TooltipRoot>
        <TooltipTrigger class="Button" aria-label="Bold">
          <span aria-hidden="true" class="Symbol">B</span>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipPositioner :side-offset="11">
            <TooltipPopup class="Popup">
              <TooltipArrow class="Arrow" />
              Bold
            </TooltipPopup>
          </TooltipPositioner>
        </TooltipPortal>
      </TooltipRoot>

      <TooltipRoot>
        <TooltipTrigger class="Button" aria-label="Italic">
          <span aria-hidden="true" class="Symbol Italic">I</span>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipPositioner :side-offset="11">
            <TooltipPopup class="Popup">
              <TooltipArrow class="Arrow" />
              Italic
            </TooltipPopup>
          </TooltipPositioner>
        </TooltipPortal>
      </TooltipRoot>

      <TooltipRoot>
        <TooltipTrigger class="Button" aria-label="Underline">
          <span aria-hidden="true" class="Symbol Underline">U</span>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipPositioner :side-offset="11">
            <TooltipPopup class="Popup">
              <TooltipArrow class="Arrow" />
              Underline
            </TooltipPopup>
          </TooltipPositioner>
        </TooltipPortal>
      </TooltipRoot>
    </div>
  </TooltipProvider>
</template>

<style src="./styles.css"></style>
