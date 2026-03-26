---
title: Checkbox
description: A high-quality, unstyled Vue checkbox component that is easy to customize.
---

# Checkbox

An easily stylable checkbox component.

<ComponentPreview name="Checkbox" />

## Usage guidelines

- Form controls need an accessible name. Use a wrapping `<label>`, a sibling label with `aria-labelledby`, or [Field](/docs/components/field) when the checkbox participates in a form.

## Anatomy

Import the checkbox parts and compose them together:

```vue title="Anatomy"
<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from 'base-ui-vue'
</script>

<template>
  <CheckboxRoot>
    <CheckboxIndicator />
  </CheckboxRoot>
</template>
```

## Examples

### Labeling a checkbox

The simplest pattern is wrapping the checkbox in a label:

```vue title="Wrapping a label around a checkbox"
<label>
  <CheckboxRoot />
  Accept terms and conditions
</label>
```

### Rendering as a native button

By default, `CheckboxRoot` renders a `<span>` so it can sit safely inside a wrapping label. When you use sibling labels, prefer a native button:

```vue title="Sibling label pattern"
<label for="notifications-checkbox">
Enable notifications
</label>

<CheckboxRoot
  id="notifications-checkbox"
  as="button"
  :native-button="true"
>
  <CheckboxIndicator />
</CheckboxRoot>
```

### Form integration

Use [Field](/docs/components/field) to connect labels, validation, and form submission:

```vue title="Using Checkbox in a form"
<script setup lang="ts">
import {
  CheckboxIndicator,
  CheckboxRoot,
  FieldLabel,
  FieldRoot,
} from 'base-ui-vue'
</script>

<template>
  <FieldRoot name="stayLoggedIn">
    <FieldLabel>
      <CheckboxRoot>
        <CheckboxIndicator />
      </CheckboxRoot>
      Stay logged in for 7 days
    </FieldLabel>
  </FieldRoot>
</template>
```

## API reference

### CheckboxRoot

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'span'` | The element or component used for the checkbox root. |
| `checked` | `boolean` | `undefined` | Controlled checked state. |
| `default-checked` | `boolean` | `false` | Uncontrolled initial checked state. |
| `disabled` | `boolean` | `false` | Whether the checkbox ignores user interaction. |
| `read-only` | `boolean` | `false` | Whether the checkbox can be focused but not toggled. |
| `required` | `boolean` | `false` | Whether the checkbox is required for form submission. |
| `indeterminate` | `boolean` | `false` | Whether the checkbox is visually in a mixed state. |
| `name` | `string` | `undefined` | Form field name. |
| `value` | `string` | `undefined` | Submitted form value and group item value. |
| `parent` | `boolean` | `false` | Whether the checkbox controls a checkbox group. |
| `unchecked-value` | `string` | `undefined` | Hidden form value submitted when the checkbox is unchecked. |
| `native-button` | `boolean` | `false` | Whether the rendered element should keep native button semantics. |

Events:

- `@checked-change="(checked, details) => {}"` fires when the checked state changes.

Attributes:

- `data-checked`
- `data-unchecked`
- `data-indeterminate`
- `data-disabled`
- `data-readonly`
- `data-required`

### CheckboxIndicator

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'span'` | The element or component used for the indicator. |
| `keep-mounted` | `boolean` | `false` | Keeps the indicator in the DOM when the checkbox is unchecked. |
