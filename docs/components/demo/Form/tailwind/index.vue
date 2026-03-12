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
  <Form class="flex w-full max-w-64 flex-col gap-4" :errors="errors" @form-submit="handleFormSubmit">
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
    <Button
      type="submit"
      :disabled="loading"
      focusable-when-disabled
      class="flex items-center justify-center h-10 px-3.5 m-0 outline-0 border border-gray-200 rounded-md bg-gray-50 font-inherit text-base font-medium leading-6 text-gray-900 select-none hover:data-disabled:bg-gray-50 hover:bg-gray-100 active:data-disabled:bg-gray-50 active:bg-gray-200 active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] active:border-t-gray-300 active:data-disabled:shadow-none active:data-disabled:border-t-gray-200 focus-visible:outline-2 focus-visible:outline-blue-800 focus-visible:-outline-offset-1 data-disabled:text-gray-500"
    >
      Submit
    </Button>
  </Form>
</template>
