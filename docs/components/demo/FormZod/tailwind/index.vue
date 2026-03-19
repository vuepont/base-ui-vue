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
  errors.value = Object.fromEntries(
    Object.entries(response.errors).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] ?? '' : value,
    ]),
  )
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
    <Button
      type="submit"
      class="flex items-center justify-center h-10 px-3.5 m-0 outline-0 border border-gray-200 rounded-md bg-gray-50 font-inherit text-base font-medium leading-6 text-gray-900 select-none hover:data-disabled:bg-gray-50 hover:bg-gray-100 active:data-disabled:bg-gray-50 active:bg-gray-200 active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] active:border-t-gray-300 active:data-disabled:shadow-none active:data-disabled:border-t-gray-200 focus-visible:outline-2 focus-visible:outline-blue-800 focus-visible:-outline-offset-1 data-disabled:text-gray-500"
    >
      Submit
    </Button>
  </Form>
</template>
