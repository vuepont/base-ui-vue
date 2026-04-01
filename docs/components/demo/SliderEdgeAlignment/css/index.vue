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
  <SliderRoot thumb-alignment="edge" :default-value="25">
    <SliderControl class="Control">
      <SliderTrack class="Track">
        <SliderIndicator class="Indicator" />
        <SliderThumb aria-label="Volume" class="Thumb" />
      </SliderTrack>
    </SliderControl>
  </SliderRoot>
</template>

<style scoped src="./styles.css"></style>
