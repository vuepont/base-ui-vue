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

### Submit with an async action

Use the `errors` prop to display validation errors returned from asynchronous submissions (for example, a server response). Keys must match each field's `name`.

<ComponentPreview name="FormAction" />

### Submit form values as a JavaScript object

You can use the `@form-submit` event instead of the native `@submit` to access form values as a JavaScript object. This is useful when you need to transform the values before submission, or integrate with 3rd party APIs. When used, `preventDefault` is called on the native submit event.

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

### Server-side errors

Pass errors from external sources (e.g. API responses) via the `errors` prop on `<Form>`. Keys must match the `name` prop on `<FieldRoot>`.

```vue
<Form :errors="{ email: 'Email already taken.' }">
  <FieldRoot name="email">
    <FieldLabel>Email</FieldLabel>
    <FieldControl />
    <FieldError />
  </FieldRoot>
</Form>
```

### Using with Zod

When parsing with `schema.safeParse()`, map `z.flattenError(result.error).fieldErrors` to `<Form :errors="...">` for field-level errors.

<ComponentPreview name="FormZod" />

### Validation mode

Control when validation runs via the `validationMode` prop (on `<Form>` or `<FieldRoot>`):

- `onSubmit` (default) -- validates on submit; re-validates on change after the first submission.
- `onBlur` -- validates when a control loses focus.
- `onChange` -- validates on every change.

## API reference

The form root element. Renders a `<form>` element.

| Prop             | Type                                           | Default      | Description                                                                                             |
| ---------------- | ---------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `as`             | `string \| Component`                          | `'form'`     | The element or component to use for the root node.                                                      |
| `validationMode` | `'onSubmit' \| 'onBlur' \| 'onChange'`         | `'onSubmit'` | Determines when validation is triggered.                                                                |
| `errors`         | `Record<string, string \| string[]>`           | --           | External validation errors keyed by field name.                                                         |
| `noValidate`     | `boolean`                                      | `true`       | Whether to disable native browser validation.                                                           |
| `class`          | `string \| ((state: State) => string)`         | --           | CSS class applied to the element, or a function that returns a class based on the component's state.    |
| `style`          | `StyleValue \| ((state: State) => StyleValue)` | --           | Style applied to the element, or a function that returns a style object based on the component's state. |

| Event        | Payload                                          | Description                                  |
| ------------ | ------------------------------------------------ | -------------------------------------------- |
| `formSubmit` | `(formValues: Record<string, unknown>, e: Event)` | Emitted when the form is submitted and valid. |

| Slot prop | Type          | Description                                                        |
| --------- | ------------- | ------------------------------------------------------------------ |
| `actions` | `FormActions` | Object with a `validate` method to imperatively trigger validation. |
