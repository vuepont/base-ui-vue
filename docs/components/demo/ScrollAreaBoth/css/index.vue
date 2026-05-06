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
  <ScrollAreaRoot class="ScrollArea">
    <ScrollAreaViewport class="Viewport">
      <ScrollAreaContent class="Content">
        <ul class="Grid">
          <li
            v-for="item in items"
            :key="item"
            class="Item"
          >
            {{ item }}
          </li>
        </ul>
      </ScrollAreaContent>
    </ScrollAreaViewport>
    <ScrollAreaScrollbar class="Scrollbar">
      <ScrollAreaThumb class="Thumb" />
    </ScrollAreaScrollbar>
    <ScrollAreaScrollbar class="Scrollbar" orientation="horizontal">
      <ScrollAreaThumb class="Thumb" />
    </ScrollAreaScrollbar>
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>

<style scoped src="./styles.css"></style>
