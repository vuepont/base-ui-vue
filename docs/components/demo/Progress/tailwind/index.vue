<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import {
  ProgressIndicator,
  ProgressLabel,
  ProgressRoot,
  ProgressTrack,
  ProgressValue,
} from 'base-ui-vue'
import { ref } from 'vue'

const value = ref<number | null>(0)

useIntervalFn(() => {
  if (value.value == null) {
    return
  }
  value.value = value.value >= 100 ? 0 : value.value + 25
}, 750)
</script>

<template>
  <ProgressRoot :value="value" class="box-border grid w-56 grid-cols-2 gap-y-2">
    <ProgressLabel class="text-sm font-normal text-gray-900">
      Export data
    </ProgressLabel>
    <ProgressValue class="col-start-2 m-0 text-right text-sm leading-5 text-gray-900" />
    <ProgressTrack class="col-span-2 block h-2 w-56 overflow-hidden bg-gray-100 shadow-[inset_0_0_0_1px] shadow-gray-200">
      <ProgressIndicator class="block bg-gray-500 transition-all duration-500" />
    </ProgressTrack>
  </ProgressRoot>
</template>
