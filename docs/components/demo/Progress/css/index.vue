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
  <ProgressRoot :value="value" class="Progress">
    <ProgressLabel class="Label">
      Export data
    </ProgressLabel>
    <ProgressValue class="Value" />
    <ProgressTrack class="Track">
      <ProgressIndicator class="Indicator" />
    </ProgressTrack>
  </ProgressRoot>
</template>

<style scoped src="./styles.css"></style>
