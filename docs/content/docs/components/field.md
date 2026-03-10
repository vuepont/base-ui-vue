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
  FieldItem,
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
    <FieldItem />
    <FieldError />
    <FieldValidity />
  </FieldRoot>
</template>
```

## API reference

### Root

Groups all parts of the field. Renders a `<div>` element.

| Prop                     | Type                                                                | Default      | Description                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `as`                     | `string \| Component`                                               | `'div'`      | The element or component to use for the root node.                                                                                  |
| `name`                   | `string`                                                            | --           | Identifies the field when a form is submitted. Takes precedence over the `name` prop on `<FieldControl>`.                          |
| `disabled`               | `boolean`                                                           | `false`      | Whether the component should ignore user interaction. Takes precedence over the `disabled` prop on `<FieldControl>`.               |
| `invalid`                | `boolean`                                                           | --           | Whether the field is invalid. Useful when the field state is controlled by an external library.                                    |
| `dirty`                  | `boolean`                                                           | --           | Whether the field's value has been changed from its initial value. Useful when the field state is controlled by an external library. |
| `touched`                | `boolean`                                                           | --           | Whether the field has been touched. Useful when the field state is controlled by an external library.                              |
| `validate`               | `(value, formValues) => string \| string[] \| null \| Promise<...>` | --           | A function for custom validation. Return a string or array of strings for invalid values, or `null` for valid values.              |
| `validationMode`         | `'onSubmit' \| 'onBlur' \| 'onChange'`                              | `'onSubmit'` | Determines when the field should be validated. Takes precedence over the `validationMode` prop on `<Form>`.                        |
| `validationDebounceTime` | `number`                                                            | `0`          | How long to wait between `validate` callbacks if `validationMode="onChange"` is used. Specified in milliseconds.                 |
| `class`                  | `string \| ((state: State) => string)`                              | --           | CSS class applied to the element, or a function that returns a class based on the component's state.                               |
| `style`                  | `StyleValue \| ((state: State) => StyleValue)`                      | --           | Style applied to the element, or a function that returns a style object based on the component's state.                            |

| Exposes    | Type         | Description                                 |
| ---------- | ------------ | ------------------------------------------- |
| `validate` | `() => void` | Validates the field when called via a component ref. |

| Attribute       | Description                                  |
| --------------- | -------------------------------------------- |
| `data-disabled` | Present when the field is disabled.          |
| `data-valid`    | Present when the field is valid.             |
| `data-invalid`  | Present when the field is invalid.           |
| `data-dirty`    | Present when the field's value has changed.  |
| `data-touched`  | Present when the field has been touched.     |
| `data-filled`   | Present when the field is filled.            |
| `data-focused`  | Present when the field control is focused.   |

### Label

An accessible label that is automatically associated with the field control. Renders a `<label>` element.

| Prop          | Type                  | Default   | Description |
| ------------- | --------------------- | --------- | ----------- |
| `as`          | `string \| Component` | `'label'` | The element or component to render. |
| `nativeLabel` | `boolean`             | `true`    | Whether the component renders a native `<label>` element. Set to `false` when rendering a non-label element. |
| `class`       | `string \| ((state: State) => string)` | -- | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style`       | `StyleValue \| ((state: State) => StyleValue)` | -- | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute       | Description                                  |
| --------------- | -------------------------------------------- |
| `data-disabled` | Present when the field is disabled.          |
| `data-valid`    | Present when the field is in valid state.    |
| `data-invalid`  | Present when the field is in invalid state.  |
| `data-dirty`    | Present when the field's value has changed.  |
| `data-touched`  | Present when the field has been touched.     |
| `data-filled`   | Present when the field is filled.            |
| `data-focused`  | Present when the field control is focused.   |

### Control

The form control to label and validate. Renders an `<input>` element.

You can omit this part and use any Base UI input component instead. For example, `Input`, `Checkbox`, or `Select`, among others, will work with Field out of the box.

| Prop           | Type                  | Default   | Description |
| -------------- | --------------------- | --------- | ----------- |
| `as`           | `string \| Component` | `'input'` | The element or component to render. |
| `defaultValue` | `string`              | `''`      | The initial uncontrolled value. |
| `class`        | `string \| ((state: State) => string)` | -- | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style`        | `StyleValue \| ((state: State) => StyleValue)` | -- | Style applied to the element, or a function that returns a style object based on the component's state. |

| Emits         | Type                     | Description |
| ------------- | ------------------------ | ----------- |
| `valueChange` | `(value: string, event: Event)` | Fired when the `value` changes. Use when controlled. |

| Attribute       | Description                                  |
| --------------- | -------------------------------------------- |
| `data-disabled` | Present when the field is disabled.          |
| `data-valid`    | Present when the field is in valid state.    |
| `data-invalid`  | Present when the field is in invalid state.  |
| `data-dirty`    | Present when the field's value has changed.  |
| `data-touched`  | Present when the field has been touched.     |
| `data-filled`   | Present when the field is filled.            |
| `data-focused`  | Present when the field control is focused.   |

### Description

A paragraph with additional information about the field. Renders a `<p>` element.

| Prop    | Type                  | Default | Description |
| ------- | --------------------- | ------- | ----------- |
| `as`    | `string \| Component` | `'p'`   | The element or component to render. |
| `class` | `string \| ((state: State) => string)` | -- | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | -- | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute       | Description                                  |
| --------------- | -------------------------------------------- |
| `data-disabled` | Present when the field is disabled.          |
| `data-valid`    | Present when the field is in valid state.    |
| `data-invalid`  | Present when the field is in invalid state.  |
| `data-dirty`    | Present when the field's value has changed.  |
| `data-touched`  | Present when the field has been touched.     |
| `data-filled`   | Present when the field is filled.            |
| `data-focused`  | Present when the field control is focused.   |

### Item

Groups individual items in a checkbox group or radio group with a label and description. Renders a `<div>` element.

| Prop       | Type                                           | Default | Description |
| ---------- | ---------------------------------------------- | ------- | ----------- |
| `as`       | `string \| Component`                          | `'div'` | The element or component to use for the item node. |
| `disabled` | `boolean`                                      | `false` | Whether the wrapped control should ignore user interaction. The `disabled` prop on `<FieldRoot>` takes precedence over this. |
| `class`    | `string \| ((state: State) => string)`         | --      | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style`    | `StyleValue \| ((state: State) => StyleValue)` | --      | Style applied to the element, or a function that returns a style object based on the component's state. |

### Error

An error message displayed if the field control fails validation. Renders a `<div>` element.

| Prop    | Type                                     | Default | Description |
| ------- | ---------------------------------------- | ------- | ----------- |
| `as`    | `string \| Component`                    | `'div'` | The element or component to render. |
| `match` | `boolean \| keyof ValidityState`         | --      | Determines whether to show the error message according to the field's `ValidityState`. Specifying `true` will always show the error message and lets external libraries control the visibility. |
| `class` | `string \| ((state: State) => string)`   | --      | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | -- | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute             | Description                                  |
| --------------------- | -------------------------------------------- |
| `data-disabled`       | Present when the field is disabled.          |
| `data-valid`          | Present when the field is in valid state.    |
| `data-invalid`        | Present when the field is in invalid state.  |
| `data-dirty`          | Present when the field's value has changed.  |
| `data-touched`        | Present when the field has been touched.     |
| `data-filled`         | Present when the field is filled.            |
| `data-focused`        | Present when the field control is focused.   |

### Validity

Used to display a custom message based on the field's validity.

| Slots              | Type               | Description |
| ------------------ | ------------------ | ----------- |
| `validity`         | `ValidityState`    | The field validity state. |
| `error`            | `string`           | The first error message. |
| `errors`           | `string[]`         | All error messages. |
| `value`            | `unknown`          | The current field value. |
| `initialValue`     | `unknown`          | The initial field value. |
| `transitionStatus` | `TransitionStatus` | The current transition status for the invalid state. |
