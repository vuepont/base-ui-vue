# Field

A component that provides labeling and validation for form controls.

<ComponentPreview name="Field" />

## Anatomy

Import the component and assemble its parts:

```vue title="Anatomy"
<script setup>
import {
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRoot,
  FieldValidity,
} from 'base-ui-vue'
</script>

<template>
  <FieldRoot>
    <FieldLabel />
    <FieldControl />
    <FieldDescription />
    <FieldError />
  </FieldRoot>
</template>
```

## API reference

### Root

Groups a label, control, description, and error for a single field. Renders a `<div>` element.

| Prop                     | Type                                                                | Default      | Description                                                                                             |
| ------------------------ | ------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `as`                     | `string \| Component`                                               | `'div'`      | The element or component to use for the root node.                                                      |
| `name`                   | `string`                                                            | --           | Identifies the field when the form is submitted.                                                        |
| `disabled`               | `boolean`                                                           | `false`      | Whether the component should ignore user interaction.                                                   |
| `validate`               | `(value, formValues) => string \| string[] \| null \| Promise<...>` | --           | A function for custom validation.                                                                       |
| `validationMode`         | `'onSubmit' \| 'onBlur' \| 'onChange'`                              | inherited    | Overrides the form-level validation mode.                                                               |
| `validationDebounceTime` | `number`                                                            | `0`          | Debounce interval (ms) for `onChange` validation.                                                       |
| `invalid`                | `boolean`                                                           | --           | Controlled invalid state.                                                                               |
| `dirty`                  | `boolean`                                                           | --           | Controlled dirty state.                                                                                 |
| `touched`                | `boolean`                                                           | --           | Controlled touched state.                                                                               |
| `class`                  | `string \| ((state: State) => string)`                              | --           | CSS class applied to the element, or a function that returns a class based on the component's state.    |
| `style`                  | `StyleValue \| ((state: State) => StyleValue)`                      | --           | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute       | Description                         |
| --------------- | ----------------------------------- |
| `data-disabled` | Present when the field is disabled. |
| `data-touched`  | Present when the field is touched.  |
| `data-dirty`    | Present when the field is dirty.    |
| `data-valid`    | Present when the field is valid.    |
| `data-invalid`  | Present when the field is invalid.  |
| `data-filled`   | Present when the field has a value. |
| `data-focused`  | Present when the field has focus.   |

### Label

An accessible label associated with the field control. Renders a `<label>` element.

| Prop | Type                  | Default   | Description                         |
| ---- | --------------------- | --------- | ----------------------------------- |
| `as` | `string \| Component` | `'label'` | The element or component to render. |
| `id` | `string`              | auto      | Overrides the auto-generated id.    |

### Control

The input control for the field. Renders an `<input>` element.

| Prop           | Type                  | Default   | Description                              |
| -------------- | --------------------- | --------- | ---------------------------------------- |
| `as`           | `string \| Component` | `'input'` | The element or component to render.      |
| `id`           | `string`              | auto      | Overrides the auto-generated control id. |
| `defaultValue` | `string`              | `''`      | The initial uncontrolled value.          |
| `value`        | `string`              | --        | The controlled value.                    |
| `disabled`     | `boolean`             | `false`   | Whether the control is disabled.         |

Standard HTML input attributes (`type`, `required`, `pattern`, `minlength`, `maxlength`, `min`, `max`, `step`, `placeholder`) are also accepted.

| Event         | Payload                  | Description                             |
| ------------- | ------------------------ | --------------------------------------- |
| `valueChange` | `(value: string, event)` | Emitted when the control value changes. |

### Description

Supplementary text linked to the control via `aria-describedby`. Renders a `<p>` element.

| Prop | Type                  | Default | Description                         |
| ---- | --------------------- | ------- | ----------------------------------- |
| `as` | `string \| Component` | `'p'`   | The element or component to render. |
| `id` | `string`              | auto    | Overrides the auto-generated id.    |

### Error

Displays validation error messages. Only renders when the field is invalid. Renders a `<div>` element.

| Prop    | Type                                     | Default | Description                                                                |
| ------- | ---------------------------------------- | ------- | -------------------------------------------------------------------------- |
| `as`    | `string \| Component`                    | `'div'` | The element or component to render.                                        |
| `match` | `string \| (value, validity) => boolean` | --      | Filters which validity state or custom condition causes the error to show. |

### Validity

A renderless component that exposes detailed validity data via a scoped slot.

| Slot prop  | Type               | Description                    |
| ---------- | ------------------ | ------------------------------ |
| `validity` | `ValidityState`    | The field's validity state.    |
| `error`    | `string`           | The first error message.       |
| `errors`   | `string[]`         | All error messages.            |
| `value`    | `unknown`          | The current field value.       |

```vue
<FieldValidity v-slot="{ validity, error }">
  <p v-if="validity.valueMissing">
    This field is required.
  </p>
  <p v-else-if="error">
    {{ error }}
  </p>
</FieldValidity>
```

## Accessibility

- `<FieldLabel>` is automatically associated with the control via `aria-labelledby`.
- `<FieldDescription>` is linked via `aria-describedby`.
- `<FieldControl>` receives `aria-invalid` when the field is in an invalid state.
- `<FieldError>` content is included in the control's `aria-describedby` for screen reader announcement.
