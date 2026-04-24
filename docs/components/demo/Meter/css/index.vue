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
  <MeterRoot :value="24" class="Meter">
    <MeterLabel class="Label">
      Storage Used
    </MeterLabel>
    <MeterValue class="Value" />
    <MeterTrack class="Track">
      <MeterIndicator class="Indicator" />
    </MeterTrack>
  </MeterRoot>
</template>

<style scoped src="./styles.css"></style>
