<script setup lang="ts">
import {
  ToolbarButton,
  ToolbarRoot,
  ToolbarSeparator,
} from 'base-ui-vue'
</script>

<template>
  <ToolbarRoot class="Toolbar" orientation="vertical" aria-label="Drawing tools">
    <ToolbarButton class="Button" aria-label="Pen">
      Pen
    </ToolbarButton>
    <ToolbarButton class="Button" aria-label="Brush">
      Brush
    </ToolbarButton>
    <ToolbarSeparator class="Separator" />
    <ToolbarButton class="Button" aria-label="Eraser">
      Eraser
    </ToolbarButton>
  </ToolbarRoot>
</template>

<style scoped src="./styles.css"></style>
