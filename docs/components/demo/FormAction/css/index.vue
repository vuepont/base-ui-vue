<script setup lang="ts">
import {
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

async function submitForm(username: string): Promise<{ errors: Record<string, string | string[]> }> {
  await new Promise(resolve => setTimeout(resolve, 1000))

  try {
    if (username === 'admin') {
      return { errors: { username: '\'admin\' is reserved for system use' } }
    }

    if (Math.random() <= 0.5) {
      return { errors: { username: `${username} is unavailable` } }
    }
  }
  catch {
    return { errors: { username: 'A server error has occurred' } }
  }

  return { errors: {} }
}

async function handleFormSubmit(formValues: Record<string, unknown>) {
  loading.value = true
  const response = await submitForm(String(formValues.username ?? ''))
  errors.value = response.errors
  loading.value = false
}
</script>

<template>
  <Form class="Form" :errors="errors" @form-submit="handleFormSubmit">
    <FieldRoot name="username" class="Field">
      <FieldLabel class="Label">
        Username
      </FieldLabel>
      <FieldControl
        required
        default-value="admin"
        placeholder="e.g. alice132"
        class="Input"
      />
      <FieldError class="Error" />
    </FieldRoot>
    <button type="submit" :disabled="loading" class="Button">
      Submit
    </button>
  </Form>
</template>
