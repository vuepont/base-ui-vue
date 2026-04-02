<script setup lang="ts">
import {
  SliderControl,
  SliderIndicator,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from 'base-ui-vue'
</script>

<template>
  <SliderRoot :default-value="[25, 45]">
    <SliderControl class="Control">
      <SliderTrack class="Track">
        <SliderIndicator class="Indicator" />
        <SliderThumb :index="0" aria-label="Minimum value" class="Thumb" />
        <SliderThumb :index="1" aria-label="Maximum value" class="Thumb" />
      </SliderTrack>
    </SliderControl>
  </SliderRoot>
</template>

<style scoped src="./styles.css"></style>
