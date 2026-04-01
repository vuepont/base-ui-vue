<script setup lang="ts">
import {
  SliderControl,
  SliderIndicator,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from 'base-ui-vue'

const thumbClasses = 'size-4 rounded-full bg-white outline-1 outline-gray-300 select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800'
</script>

<template>
  <SliderRoot thumb-alignment="edge" :default-value="25">
    <SliderControl class="flex w-56 touch-none items-center py-3 select-none">
      <SliderTrack class="h-1 w-full rounded-sm bg-gray-200 shadow-[inset_0_0_0_1px] shadow-gray-200 select-none">
        <SliderIndicator class="rounded-sm bg-gray-700 select-none" />
        <SliderThumb aria-label="Volume" :class="thumbClasses" />
      </SliderTrack>
    </SliderControl>
  </SliderRoot>
</template>
