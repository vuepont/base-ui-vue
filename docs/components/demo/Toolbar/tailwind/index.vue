<script setup lang="ts">
// TODO: Replace this simplified formatting-toolbar demo with the richer React
// docs example once the Vue package has companion components like ToggleGroup
// and Select for a full editor-style toolbar composition.
import {
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarRoot,
  ToolbarSeparator,
} from 'base-ui-vue'
</script>

<template>
  <ToolbarRoot class="flex w-full max-w-[37.5rem] items-center gap-px rounded-md border border-gray-200 bg-gray-50 p-0.5" aria-label="Text formatting">
    <ToolbarGroup class="flex gap-1" aria-label="Text style">
      <ToolbarButton class="flex size-8 items-center justify-center rounded-xs text-sm font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-disabled:text-gray-500" aria-label="Bold">
        B
      </ToolbarButton>
      <ToolbarButton class="flex size-8 items-center justify-center rounded-xs text-sm font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-disabled:text-gray-500" aria-label="Italic">
        I
      </ToolbarButton>
      <ToolbarButton class="flex size-8 items-center justify-center rounded-xs text-sm font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-disabled:text-gray-500" aria-label="Underline">
        U
      </ToolbarButton>
    </ToolbarGroup>
    <ToolbarSeparator class="m-1 h-4 w-px bg-gray-300" />
    <ToolbarGroup class="flex gap-1" aria-label="Alignment">
      <ToolbarButton class="flex h-8 items-center justify-center rounded-xs px-3 text-sm text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-disabled:text-gray-500" aria-label="Align left">
        Left
      </ToolbarButton>
      <ToolbarButton class="flex h-8 items-center justify-center rounded-xs px-3 text-sm text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-disabled:text-gray-500" aria-label="Align center">
        Center
      </ToolbarButton>
    </ToolbarGroup>
    <ToolbarSeparator class="m-1 h-4 w-px bg-gray-300" />
    <ToolbarInput class="h-8 w-12 rounded-xs bg-transparent text-center text-sm text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-disabled:text-gray-500" default-value="12" aria-label="Font size" />
    <ToolbarLink class="ml-auto mr-3.5 text-sm text-gray-500 no-underline hover:text-blue-800 focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-blue-800" href="#toolbar-demo">
      Edited 51m ago
    </ToolbarLink>
  </ToolbarRoot>
</template>
