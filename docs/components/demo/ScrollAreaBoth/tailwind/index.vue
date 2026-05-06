<script setup lang="ts">
import {
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from 'base-ui-vue'

const items = Array.from({ length: 100 }, (_, i) => i + 1)
</script>

<template>
  <ScrollAreaRoot class="h-80 w-80 max-w-[calc(100vw-8rem)]">
    <ScrollAreaViewport class="h-full rounded-lg border border-gray-200 focus-visible:outline focus-visible:outline-blue-800 focus-visible:outline-offset-2">
      <ScrollAreaContent class="p-5">
        <ul class="m-0 grid list-none grid-cols-[repeat(10,6.25rem)] grid-rows-[repeat(10,6.25rem)] gap-3 p-0">
          <li
            v-for="item in items"
            :key="item"
            class="flex items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-600"
          >
            {{ item }}
          </li>
        </ul>
      </ScrollAreaContent>
    </ScrollAreaViewport>
    <ScrollAreaScrollbar
      class="relative m-2 flex w-1 rounded-sm bg-gray-200 opacity-0 transition-opacity pointer-events-none before:absolute before:left-1/2 before:h-full before:w-5 before:-translate-x-1/2 before:content-[''] data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0"
    >
      <ScrollAreaThumb class="w-full rounded-sm bg-gray-500" />
    </ScrollAreaScrollbar>
    <ScrollAreaScrollbar
      orientation="horizontal"
      class="relative m-2 flex h-1 rounded-sm bg-gray-200 opacity-0 transition-opacity pointer-events-none before:absolute before:-bottom-2 before:left-0 before:right-0 before:h-5 before:w-full before:content-[''] data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0"
    >
      <ScrollAreaThumb class="w-full rounded-sm bg-gray-500" />
    </ScrollAreaScrollbar>
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
