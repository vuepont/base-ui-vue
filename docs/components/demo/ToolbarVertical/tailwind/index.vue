<script setup lang="ts">
import {
  ToolbarButton,
  ToolbarRoot,
  ToolbarSeparator,
} from 'base-ui-vue'
</script>

<template>
  <ToolbarRoot class="inline-flex flex-col gap-1 rounded-md border border-gray-200 bg-gray-50 p-1" orientation="vertical" aria-label="Drawing tools">
    <ToolbarButton class="flex min-w-16 items-center justify-center rounded-xs px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800" aria-label="Pen">
      Pen
    </ToolbarButton>
    <ToolbarButton class="flex min-w-16 items-center justify-center rounded-xs px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800" aria-label="Brush">
      Brush
    </ToolbarButton>
    <ToolbarSeparator class="h-px w-full bg-gray-300" />
    <ToolbarButton class="flex min-w-16 items-center justify-center rounded-xs px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800" aria-label="Eraser">
      Eraser
    </ToolbarButton>
  </ToolbarRoot>
</template>
