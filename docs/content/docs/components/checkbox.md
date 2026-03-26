---
title: Checkbox
description: A high-quality, unstyled Vue checkbox component that is easy to customize.
---

# Checkbox

An easily stylable checkbox component.

<ComponentPreview name="Checkbox" />

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See [Labeling a checkbox](#labeling-a-checkbox) and the [forms guide](/docs/handbook/forms).

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

```vue{1,4} title="Wrapping a label around a checkbox"
<label>
  <CheckboxRoot />
  Accept terms and conditions
</label>
```

### Rendering as a native button

By default, `CheckboxRoot` renders a `<span>` element to support enclosing labels. Prefer rendering the checkbox as a native button when using sibling labels (`for`/`id`).

```vue title="Sibling label pattern with a native button"
<div>
  <label for="notifications-checkbox">Enable notifications</label>
  <CheckboxRoot
    id="notifications-checkbox"
    as="button"
    :native-button="true"
  >
    <CheckboxIndicator />
  </CheckboxRoot>
</div>
```

Native buttons with wrapping labels are supported by using renderless mode so the hidden input is placed outside the label:

```vue{7-14} title="Render callback"
<script setup lang="ts">
import { CheckboxRoot, Slot } from 'base-ui-vue'
</script>

<template>
  <CheckboxRoot
    v-slot="{ props, ref }"
    :as="Slot"
    :native-button="true"
  >
    <label>
      <button :ref="ref" v-bind="props" />
      Enable notifications
    </label>
  </CheckboxRoot>
</template>
```

### Form integration

Use [Field](/docs/components/field) to handle label associations and form integration:

```vue{13} title="Using Checkbox in a form"
<script setup lang="ts">
import {
  CheckboxIndicator,
  CheckboxRoot,
  Form,
  FieldLabel,
  FieldRoot,
} from 'base-ui-vue'
</script>

<template>
  <Form>
    <FieldRoot name="stayLoggedIn">
      <FieldLabel>
        <CheckboxRoot>
          <CheckboxIndicator />
        </CheckboxRoot>
        Stay logged in for 7 days
      </FieldLabel>
    </FieldRoot>
  </Form>
</template>
```

## API reference

### Root

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'span'` | The element or component used for the checkbox root. |
| `checked` | `boolean` | `undefined` | Whether the checkbox is currently ticked. To render an uncontrolled checkbox, use the `default-checked` prop instead. |
| `default-checked` | `boolean` | `false` | Whether the checkbox is initially ticked. To render a controlled checkbox, use the `checked` prop instead. |
| `disabled` | `boolean` | `false` | Whether the component should ignore user interaction. |
| `read-only` | `boolean` | `false` | Whether the user should be unable to tick or untick the checkbox. |
| `required` | `boolean` | `false` | Whether the user must tick the checkbox before submitting a form. |
| `indeterminate` | `boolean` | `false` | Whether the checkbox is in a mixed state: neither ticked, nor unticked. |
| `name` | `string` | `undefined` | Identifies the field when a form is submitted. |
| `value` | `string` | `undefined` | The value of the selected checkbox. |
| `parent` | `boolean` | `false` | Whether the checkbox controls a group of child checkboxes. |
| `unchecked-value` | `string` | `undefined` | The value submitted with the form when the checkbox is unchecked. By default, unchecked checkboxes do not submit any value, matching native checkbox behavior. |
| `native-button` | `boolean` | `false` | Whether the component renders a native `<button>` element when replacing it via the `as` prop. Set to `true` if the rendered element is a native button. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Emits | Type | Description |
| ----- | ---- | ----------- |
| `checked-change` | `(checked: boolean, details: EventDetails) => void` | Emitted when the checkbox is ticked or unticked. |

| Attribute | Description |
| --------- | ----------- |
| `data-checked` | Present when the checkbox is checked. |
| `data-unchecked` | Present when the checkbox is unchecked. |
| `data-disabled` | Present when the checkbox is disabled. |
| `data-readonly` | Present when the checkbox is read-only. |
| `data-required` | Present when the checkbox is required. |
| `data-valid` | Present when the checkbox is valid. |
| `data-invalid` | Present when the checkbox is invalid. |
| `data-dirty` | Present when the checkbox's value has changed. |
| `data-touched` | Present when the checkbox has been touched. |
| `data-filled` | Present when the checkbox is checked. |
| `data-focused` | Present when the checkbox is focused. |
| `data-indeterminate` | Present when the checkbox is in an indeterminate state. |
| `data-parent` | Present when the checkbox is acting as the parent checkbox for a group. |

### Indicator

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'span'` | The element or component used for the indicator. |
| `keep-mounted` | `boolean` | `false` | Whether to keep the element in the DOM when the checkbox is not checked. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute | Description |
| --------- | ----------- |
| `data-checked` | Present when the checkbox is checked. |
| `data-unchecked` | Present when the checkbox is unchecked. |
| `data-disabled` | Present when the checkbox is disabled. |
| `data-readonly` | Present when the checkbox is read-only. |
| `data-required` | Present when the checkbox is required. |
| `data-valid` | Present when the checkbox is valid. |
| `data-invalid` | Present when the checkbox is invalid. |
| `data-dirty` | Present when the checkbox's value has changed. |
| `data-touched` | Present when the checkbox has been touched. |
| `data-filled` | Present when the checkbox is checked. |
| `data-focused` | Present when the checkbox is focused. |
| `data-indeterminate` | Present when the checkbox is in an indeterminate state. |
| `data-starting-style` | Present when the indicator is animating in. |
| `data-ending-style` | Present when the indicator is animating out. |
