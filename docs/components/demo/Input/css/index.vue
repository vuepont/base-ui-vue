<script setup lang="ts">
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRoot,
  Input,
} from 'base-ui-vue'
</script>

<template>
  <FieldRoot class="Field">
    <FieldLabel class="Label">
      Email
    </FieldLabel>
    <Input
      type="email"
      required
      placeholder="you@example.com"
      class="Input"
    />
    <FieldError class="Error" match="valueMissing">
      Please enter your email
    </FieldError>
    <FieldError class="Error" match="typeMismatch">
      Please enter a valid email address
    </FieldError>
    <FieldDescription class="Description">
      We'll never share your email
    </FieldDescription>
  </FieldRoot>
</template>

<style scoped src="./styles.css"></style>
