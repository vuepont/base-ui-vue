<script setup lang="ts">
import {
  Toggle,
  ToggleGroup,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarRoot,
  ToolbarSeparator,
} from 'base-ui-vue'
</script>

<template>
  <ToolbarRoot class="flex w-[37.5rem] items-center gap-px rounded-md border border-gray-200 bg-gray-50 p-0.5" aria-label="Text formatting">
    <ToggleGroup class="flex gap-1" aria-label="Alignment">
      <ToolbarButton :as="Toggle" class="flex h-8 items-center justify-center rounded-xs px-3 font-[inherit] text-sm font-normal text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900" value="align-left" aria-label="Align left">
        Align Left
      </ToolbarButton>
      <ToolbarButton :as="Toggle" class="flex h-8 items-center justify-center rounded-xs px-3 font-[inherit] text-sm font-normal text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900" value="align-right" aria-label="Align right">
        Align Right
      </ToolbarButton>
    </ToggleGroup>
    <ToolbarSeparator class="m-1 h-4 w-px bg-gray-300" />
    <ToolbarGroup class="flex gap-1" aria-label="Number format">
      <ToolbarButton class="flex size-8 items-center justify-center rounded-xs px-3 font-[inherit] text-sm font-normal text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900 data-disabled:text-gray-500" aria-label="Format as currency">
        $
      </ToolbarButton>
      <ToolbarButton class="flex size-8 items-center justify-center rounded-xs px-3 font-[inherit] text-sm font-normal text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900 data-disabled:text-gray-500" aria-label="Format as percent">
        %
      </ToolbarButton>
    </ToolbarGroup>
    <ToolbarSeparator class="m-1 h-4 w-px bg-gray-300" />
    <!-- TODO: Replace this HTML select trigger stand-in with Select once the Vue package includes it. -->
    <button type="button" role="combobox" aria-label="Font family" aria-haspopup="listbox" aria-expanded="false" class="flex h-8 min-w-[8rem] items-center justify-between gap-3 rounded-xs px-3 text-sm font-normal text-gray-600 select-none hover:bg-gray-100 focus-visible:bg-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 cursor-default">
      <span>Helvetica</span>
      <span class="flex" aria-hidden="true">
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M0.5 4.5L4 1.5L7.5 4.5" />
          <path d="M0.5 7.5L4 10.5L7.5 7.5" />
        </svg>
      </span>
    </button>
    <ToolbarSeparator class="m-1 h-4 w-px bg-gray-300" />
    <ToolbarLink class="ml-auto mr-3.5 self-center flex-none text-sm text-gray-500! no-underline! hover:text-blue-800! focus-visible:rounded-xs focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-800" href="#toolbar-demo">
      Edited 51m ago
    </ToolbarLink>
  </ToolbarRoot>
</template>
