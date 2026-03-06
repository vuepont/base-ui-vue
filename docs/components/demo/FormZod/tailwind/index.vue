<script setup lang="ts">
import {
  FieldControl,
  FieldError,
  FieldLabel,
  FieldRoot,
  Form,
} from 'base-ui-vue'
import { ref } from 'vue'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.coerce.number('Age must be a number').positive('Age must be a positive number'),
})

const errors = ref<Record<string, string | string[]>>({})

async function submitForm(formValues: Record<string, unknown>) {
  const result = schema.safeParse(formValues)

  if (!result.success) {
    return {
      errors: z.flattenError(result.error).fieldErrors,
    }
  }

  return { errors: {} }
}

async function handleFormSubmit(formValues: Record<string, unknown>) {
  const response = await submitForm(formValues)
  errors.value = response.errors
}
</script>

<template>
  <Form class="flex w-full max-w-64 flex-col gap-4" :errors="errors" @form-submit="handleFormSubmit">
    <FieldRoot name="name" class="flex flex-col items-start gap-1">
      <FieldLabel class="text-sm font-medium text-gray-900">
        Name
      </FieldLabel>
      <FieldControl
        placeholder="Enter name"
        class="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
      />
      <FieldError class="text-sm text-red-800" />
    </FieldRoot>
    <FieldRoot name="age" class="flex flex-col items-start gap-1">
      <FieldLabel class="text-sm font-medium text-gray-900">
        Age
      </FieldLabel>
      <FieldControl
        placeholder="Enter age"
        class="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
      />
      <FieldError class="text-sm text-red-800" />
    </FieldRoot>
    <button
      type="submit"
      class="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-gray-900 select-none hover:not-disabled:bg-gray-100 active:not-disabled:bg-gray-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 disabled:text-gray-500"
    >
      Submit
    </button>
  </Form>
</template>
