<script setup lang="ts">
import {
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRoot,
} from 'base-ui-vue'
</script>

<template>
  <FieldRoot class="Field">
    <FieldLabel class="Label">
      Name
    </FieldLabel>
    <FieldControl required placeholder="Required" class="Input" />
    <FieldError class="Error" match="valueMissing">
      Please enter your name
    </FieldError>
    <FieldDescription class="Description">
      Visible on your profile
    </FieldDescription>
  </FieldRoot>
</template>

<style scoped src="./styles.css"></style>
