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
  <SliderRoot orientation="vertical" :default-value="35">
    <SliderControl class="flex touch-none select-none data-[orientation=vertical]:h-32 data-[orientation=vertical]:px-3">
      <SliderTrack class="rounded-sm bg-gray-200 shadow-[inset_0_0_0_1px] shadow-gray-200 select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1">
        <SliderIndicator class="rounded-sm bg-gray-700 select-none" />
        <SliderThumb aria-label="Volume" :class="thumbClasses" />
      </SliderTrack>
    </SliderControl>
  </SliderRoot>
</template>
