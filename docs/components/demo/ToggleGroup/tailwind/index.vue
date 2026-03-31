<script setup lang="ts">
import { Toggle, ToggleGroup } from 'base-ui-vue'

const buttonClasses = 'flex size-8 items-center justify-center rounded-sm text-gray-600 select-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900'
</script>

<template>
  <ToggleGroup
    :default-value="['left']"
    aria-label="Text alignment"
    class="flex gap-px rounded-md border border-gray-200 bg-gray-50 p-0.5"
  >
    <Toggle aria-label="Align left" value="left" :class="buttonClasses">
      <svg class="size-4" width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" stroke-linecap="round">
        <path d="M2.5 3.5H13.5" />
        <path d="M2.5 9.5H13.5" />
        <path d="M2.5 6.5H10.5" />
        <path d="M2.5 12.5H10.5" />
      </svg>
    </Toggle>
    <Toggle aria-label="Align center" value="center" :class="buttonClasses">
      <svg class="size-4" width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" stroke-linecap="round">
        <path d="M3 3.5H14" />
        <path d="M3 9.5H14" />
        <path d="M4.5 6.5H12.5" />
        <path d="M4.5 12.5H12.5" />
      </svg>
    </Toggle>
    <Toggle aria-label="Align right" value="right" :class="buttonClasses">
      <svg class="size-4" width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" stroke-linecap="round">
        <path d="M2.5 3.5H13.5" />
        <path d="M2.5 9.5H13.5" />
        <path d="M5.5 6.5H13.5" />
        <path d="M5.5 12.5H13.5" />
      </svg>
    </Toggle>
  </ToggleGroup>
</template>
