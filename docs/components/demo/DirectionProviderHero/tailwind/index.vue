<script setup lang="ts">
import {
  DirectionProvider,
  SliderControl,
  SliderIndicator,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from 'base-ui-vue'
</script>

<template>
  <div dir="rtl">
    <DirectionProvider direction="rtl">
      <SliderRoot :default-value="25">
        <SliderControl class="flex w-56 items-center py-3">
          <SliderTrack class="relative h-1 w-full rounded-sm bg-gray-200 shadow-[inset_0_0_0_1px] shadow-gray-200">
            <SliderIndicator class="rounded-sm bg-gray-700" />
            <SliderThumb aria-label="Value" class="size-4 rounded-full bg-white outline-1 outline-gray-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800" />
          </SliderTrack>
        </SliderControl>
      </SliderRoot>
    </DirectionProvider>
  </div>
</template>
