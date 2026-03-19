<script setup lang="ts">
import {
  Button,
  FieldControl,
  FieldError,
  FieldLabel,
  FieldRoot,
  Form,
} from 'base-ui-vue'
import { ref } from 'vue'
import './styles.css'

const errors = ref<Record<string, string | string[]>>({})
const loading = ref(false)

async function submitForm(value: string) {
  await new Promise(resolve => setTimeout(resolve, 1000))

  try {
    const url = new URL(value)
    if (url.hostname.endsWith('example.com')) {
      return { error: 'The example domain is not allowed' }
    }
  }
  catch {
    return { error: 'This is not a valid URL' }
  }

  return { success: true }
}

async function handleFormSubmit(formValues: Record<string, unknown>) {
  const value = String(formValues.url ?? '')
  loading.value = true
  const response = await submitForm(value)
  errors.value = response.error ? { url: response.error } : {}
  loading.value = false
}
</script>

<template>
  <Form class="Form" :errors="errors" @form-submit="handleFormSubmit">
    <FieldRoot name="url" class="Field">
      <FieldLabel class="Label">
        Homepage
      </FieldLabel>
      <FieldControl
        type="url"
        required
        default-value="https://example.com"
        placeholder="https://example.com"
        pattern="https?://.*"
        class="Input"
      />
      <FieldError class="Error" />
    </FieldRoot>
    <Button type="submit" :disabled="loading" focusable-when-disabled class="Button">
      Submit
    </Button>
  </Form>
</template>
