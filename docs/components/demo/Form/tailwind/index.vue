<script setup lang="ts">
import { FieldControl, FieldError, FieldLabel, FieldRoot, FormRoot } from 'base-ui-vue'
import { ref } from 'vue'

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

async function handleSubmit(event: Event) {
  event.preventDefault()
  const formData = new FormData(event.target as HTMLFormElement)
  const value = formData.get('url') as string

  loading.value = true
  const response = await submitForm(value)
  errors.value = response.error ? { url: response.error } : {}
  loading.value = false
}
</script>

<template>
  <FormRoot class="flex w-full max-w-64 flex-col gap-4" :errors="errors" @submit="handleSubmit">
    <FieldRoot name="url" class="flex flex-col items-start gap-1">
      <FieldLabel class="text-sm font-medium text-gray-900">
        Homepage
      </FieldLabel>
      <FieldControl
        type="url"
        required
        default-value="https://example.com"
        placeholder="https://example.com"
        pattern="https?://.*"
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
  </FormRoot>
</template>
