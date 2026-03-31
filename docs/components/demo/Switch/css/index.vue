<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'base-ui-vue'
</script>

<template>
  <label class="Label">
    <SwitchRoot :default-checked="true" class="Switch">
      <SwitchThumb class="Thumb" />
    </SwitchRoot>
    Notifications
  </label>
</template>

<style src="./styles.css"></style>
