<script setup lang="ts">
import { CollapsiblePanel, CollapsibleRoot, CollapsibleTrigger } from 'base-ui-vue'
</script>

<template>
  <CollapsibleRoot class="flex min-h-36 w-56 flex-col justify-center text-gray-900">
    <CollapsibleTrigger class="group flex items-center gap-2 rounded-xs bg-gray-100 px-2 py-1 text-sm font-medium hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-blue-800 active:bg-gray-200">
      <svg
        class="size-3 transition-all ease-out group-data-panel-open:rotate-90"
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
      >
        <path d="M3.5 9L7.5 5L3.5 1" stroke="currentcolor" />
      </svg>
      Recovery keys
    </CollapsibleTrigger>
    <CollapsiblePanel class="flex h-(--collapsible-panel-height) flex-col justify-end overflow-hidden text-sm transition-all duration-150 ease-out data-ending-style:h-0 data-starting-style:h-0 [&[hidden]:not([hidden='until-found'])]:hidden">
      <div class="mt-1 flex cursor-text flex-col gap-2 rounded-xs bg-gray-100 py-2 pl-7">
        <div>alien-bean-pasta</div>
        <div>wild-irish-burrito</div>
        <div>horse-battery-staple</div>
      </div>
    </CollapsiblePanel>
  </CollapsibleRoot>
</template>
