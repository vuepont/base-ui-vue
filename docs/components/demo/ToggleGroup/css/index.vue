<script setup lang="ts">
import { Toggle, ToggleGroup } from 'base-ui-vue'
</script>

<template>
  <ToggleGroup :default-value="['left']" class="Panel">
    <Toggle aria-label="Align left" value="left" class="Button">
      <svg class="Icon" width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" stroke-linecap="round">
        <path d="M2.5 3.5H13.5" />
        <path d="M2.5 9.5H13.5" />
        <path d="M2.5 6.5H10.5" />
        <path d="M2.5 12.5H10.5" />
      </svg>
    </Toggle>
    <Toggle aria-label="Align center" value="center" class="Button">
      <svg class="Icon" width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" stroke-linecap="round">
        <path d="M3 3.5H14" />
        <path d="M3 9.5H14" />
        <path d="M4.5 6.5H12.5" />
        <path d="M4.5 12.5H12.5" />
      </svg>
    </Toggle>
    <Toggle aria-label="Align right" value="right" class="Button">
      <svg class="Icon" width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" stroke-linecap="round">
        <path d="M2.5 3.5H13.5" />
        <path d="M2.5 9.5H13.5" />
        <path d="M5.5 6.5H13.5" />
        <path d="M5.5 12.5H13.5" />
      </svg>
    </Toggle>
  </ToggleGroup>
</template>

<style src="./styles.css"></style>
