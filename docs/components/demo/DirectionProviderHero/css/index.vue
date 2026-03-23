<script setup lang="ts">
import { DirectionProvider } from 'base-ui-vue'
import SliderPreview from './SliderPreview.vue'
import './styles.css'

// TODO: Replace this docs-only slider illustration with Slider when the Vue package includes it.
</script>

<template>
  <div dir="rtl">
    <DirectionProvider direction="rtl">
      <SliderPreview />
    </DirectionProvider>
  </div>
</template>
