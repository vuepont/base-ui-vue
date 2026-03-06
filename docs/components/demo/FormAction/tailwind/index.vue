<script setup lang="ts">
import {
  FieldControl,
  FieldError,
  FieldLabel,
  FieldRoot,
  Form,
} from 'base-ui-vue'
import { ref } from 'vue'

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
  <Form class="flex w-full max-w-64 flex-col gap-4" :errors="errors" @form-submit="handleFormSubmit">
    <FieldRoot name="username" class="flex flex-col items-start gap-1">
      <FieldLabel class="text-sm font-medium text-gray-900">
        Username
      </FieldLabel>
      <FieldControl
        required
        default-value="admin"
        placeholder="e.g. alice132"
        class="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
      />
      <FieldError class="text-sm text-red-800" />
    </FieldRoot>
    <button
      type="submit"
      :disabled="loading"
      class="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-gray-900 select-none hover:not-disabled:bg-gray-100 active:not-disabled:bg-gray-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 disabled:text-gray-500"
    >
      Submit
    </button>
  </Form>
</template>
