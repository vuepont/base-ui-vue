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
  <SliderRoot orientation="vertical" :default-value="35">
    <SliderControl class="Control">
      <SliderTrack class="Track VerticalTrack">
        <SliderIndicator class="Indicator" />
        <SliderThumb aria-label="Volume" class="Thumb" />
      </SliderTrack>
    </SliderControl>
  </SliderRoot>
</template>

<style scoped src="./styles.css"></style>
