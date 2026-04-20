<script setup lang="ts">
import {
  MeterIndicator,
  MeterLabel,
  MeterRoot,
  MeterTrack,
  MeterValue,
} from 'base-ui-vue'
</script>

<template>
  <MeterRoot :value="24" class="box-border grid w-48 grid-cols-2 gap-y-2">
    <MeterLabel class="text-sm font-normal text-gray-900">
      Storage Used
    </MeterLabel>
    <MeterValue class="col-start-2 m-0 text-right text-sm leading-5 text-gray-900" />
    <MeterTrack class="col-span-2 block h-2 w-48 overflow-hidden bg-gray-100 shadow-[inset_0_0_0_1px] shadow-gray-200">
      <MeterIndicator class="block bg-gray-500 transition-all duration-500" />
    </MeterTrack>
  </MeterRoot>
</template>
