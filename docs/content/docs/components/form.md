# Form

A native form element with consolidated error handling.

<ComponentPreview name="Form" />

## Anatomy

Form is composed together with [Field](/docs/components/field). Import the components and place them together:

```vue title="Anatomy"
<script setup>
import { FieldControl, FieldError, FieldLabel, FieldRoot, Form } from 'base-ui-vue'
</script>

<template>
  <Form>
    <FieldRoot>
      <FieldLabel />
      <FieldControl />
      <FieldError />
    </FieldRoot>
  </Form>
</template>
```

## Examples

### Submit form values as a JavaScript object

You can use the `@form-submit` event instead of the native `submit` event to access form values as a JavaScript object. This is useful when you need to transform the values before submission, or integrate with 3rd party APIs. When used, `preventDefault` is called on the native submit event.

```vue
<script setup>
async function handleFormSubmit(formValues) {
  const payload = {
    product_id: formValues.id,
    order_quantity: formValues.quantity,
  }

  await fetch('https://api.example.com', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
</script>

<template>
  <Form @form-submit="handleFormSubmit">
    <!-- fields -->
  </Form>
</template>
```

### Using with Zod

When parsing with `schema.safeParse()`, use `z.flattenError(result.error).fieldErrors` to build the `errors` prop for `<Form>`, where keys match each field&#39;s `name`.

<ComponentPreview name="FormZod" />

## API reference

| Prop             | Type                                           | Default      | Description                                                                                             |
| ---------------- | ---------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `as`             | `string \| Component`                          | `'form'`     | The element or component to use for the root node.                                                      |
| `validationMode` | `'onSubmit' \| 'onBlur' \| 'onChange'`         | `'onSubmit'` | Determines when validation is triggered.                                                                |
| `errors`         | `Record<string, string \| string[]>`           | --           | External validation errors keyed by field name.                                                         |
| `noValidate`     | `boolean`                                      | `true`       | Whether to disable native browser validation.                                                           |
| `class`          | `string \| ((state: State) => string)`         | --           | CSS class applied to the element, or a function that returns a class based on the component's state.    |
| `style`          | `StyleValue \| ((state: State) => StyleValue)` | --           | Style applied to the element, or a function that returns a style object based on the component's state. |

| Emits          | Type                                             | Description                                  |
| -------------- | ------------------------------------------------ | -------------------------------------------- |
| `@form-submit` | `(formValues: Record<string, unknown>, e: Event)` | Emitted when the form is submitted and valid. |

| Slots     | Type          | Description                                                        |
| --------- | ------------- | ------------------------------------------------------------------ |
| `actions` | `FormActions` | Object with a `validate` method to imperatively trigger validation. |
