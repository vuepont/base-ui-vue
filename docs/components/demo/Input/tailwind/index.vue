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
  <FieldRoot class="flex w-full max-w-64 flex-col items-start gap-1">
    <FieldLabel class="text-sm font-medium text-gray-900">
      Email
    </FieldLabel>
    <Input
      type="email"
      required
      placeholder="you@example.com"
      class="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
    />
    <FieldError class="text-sm text-red-800" match="valueMissing">
      Please enter your email
    </FieldError>
    <FieldError class="text-sm text-red-800" match="typeMismatch">
      Please enter a valid email address
    </FieldError>
    <FieldDescription class="text-sm text-gray-600">
      We'll never share your email
    </FieldDescription>
  </FieldRoot>
</template>
