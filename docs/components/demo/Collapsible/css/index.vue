<script setup lang="ts">
import { CollapsiblePanel, CollapsibleRoot, CollapsibleTrigger } from 'base-ui-vue'
</script>

<template>
  <CollapsibleRoot class="Collapsible">
    <CollapsibleTrigger class="Trigger">
      <svg class="Icon" width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M3.5 9L7.5 5L3.5 1" stroke="currentcolor" />
      </svg>
      Recovery keys
    </CollapsibleTrigger>
    <CollapsiblePanel class="Panel">
      <div class="Content">
        <div>alien-bean-pasta</div>
        <div>wild-irish-burrito</div>
        <div>horse-battery-staple</div>
      </div>
    </CollapsiblePanel>
  </CollapsibleRoot>
</template>

<style scoped src="./styles.css"></style>
