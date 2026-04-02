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
        <SliderControl class="Control">
          <SliderTrack class="Track">
            <SliderIndicator class="Indicator" />
            <SliderThumb aria-label="Value" class="Thumb" />
          </SliderTrack>
        </SliderControl>
      </SliderRoot>
    </DirectionProvider>
  </div>
</template>

<style scoped src="./styles.css"></style>
