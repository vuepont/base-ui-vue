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
  <Form class="Form" :errors="errors" @form-submit="handleFormSubmit">
    <FieldRoot name="name" class="Field">
      <FieldLabel class="Label">
        Name
      </FieldLabel>
      <FieldControl placeholder="Enter name" class="Input" />
      <FieldError class="Error" />
    </FieldRoot>
    <FieldRoot name="age" class="Field">
      <FieldLabel class="Label">
        Age
      </FieldLabel>
      <FieldControl placeholder="Enter age" class="Input" />
      <FieldError class="Error" />
    </FieldRoot>
    <Button type="submit" class="Button">
      Submit
    </Button>
  </Form>
</template>

<style scoped src="./styles.css"></style>
