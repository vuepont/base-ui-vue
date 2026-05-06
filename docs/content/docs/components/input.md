---
title: Input
description: A high-quality, unstyled Vue input component that automatically integrates with Field for labeling and validation.
---

# Input

A native input element that automatically integrates with [Field](/docs/components/field) for labeling and validation.

<ComponentPreview name="Input" />

## Introduction

`Input` is a thin wrapper around [Field Control](/docs/components/field) that provides a standalone, semantic API for rendering native `<input>` elements. When placed inside a `FieldRoot`, it gains labeling, validation, and state management with zero extra configuration.

You can use `Input` as a drop-in replacement for `FieldControl` when your form control is a standard text input.

## Anatomy

Import the component and place it inside a `FieldRoot`:

```vue title="Anatomy"
<script setup>
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRoot,
  Input,
} from 'base-ui-vue'
</script>

<template>
  <FieldRoot>
    <FieldLabel />
    <Input />
    <FieldDescription />
    <FieldError />
  </FieldRoot>
</template>
```

`Input` can also be used standalone without `FieldRoot`, in which case it renders a plain `<input>` without Field integration.

## Standalone usage

When you don't need labeling or validation, use `Input` on its own:

```vue
<script setup>
import { Input } from 'base-ui-vue'
</script>

<template>
  <Input placeholder="Search…" />
</template>
```

## Controlled value

Use the `value` prop to control the input's value and the `@value-change` event to listen for changes:

```vue
<script setup>
import { FieldRoot, Input } from 'base-ui-vue'
import { ref } from 'vue'

const search = ref('')
</script>

<template>
  <FieldRoot>
    <Input :value="search" @value-change="(v) => search = v" />
  </FieldRoot>
</template>
```

## Rendering a different element

Use the `as` prop to render a different element, such as a `textarea`:

```vue
<script setup>
import { FieldRoot, Input } from 'base-ui-vue'
</script>

<template>
  <FieldRoot>
    <Input as="textarea" />
  </FieldRoot>
</template>
```

## API reference

### Input

Renders a native `<input>` element. Wraps `FieldControl` with all of its capabilities.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'input'` | The element or component to render. |
| `value` | `string` | -- | The controlled value of the input. |
| `defaultValue` | `string` | `''` | The default value when uncontrolled. |
| `name` | `string` | -- | Identifies the input when a form is submitted. |
| `disabled` | `boolean` | `false` | Whether the input is disabled. |
| `required` | `boolean` | -- | Whether the input is required. |
| `type` | `string` | -- | The input's type attribute (e.g., `text`, `email`, `password`). |
| `placeholder` | `string` | -- | Placeholder text shown when the input is empty. |
| `pattern` | `string` | -- | A regex pattern the input's value must match. |
| `minlength` | `number` | -- | Minimum number of characters. |
| `maxlength` | `number` | -- | Maximum number of characters. |
| `min` | `string \| number` | -- | Minimum value for `number` and date inputs. |
| `max` | `string \| number` | -- | Maximum value for `number` and date inputs. |
| `step` | `string \| number` | -- | Step increment for `number` and date inputs. |
| `autofocus` | `boolean` | `false` | Whether to focus the input on mount. |
| `class` | `string \| ((state: State) => string)` | -- | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | -- | Style applied to the element, or a function that returns a style object based on the component's state. |

| Event | Type | Description |
| --- | --- | --- |
| `@value-change` | `(value: string, event: Event) => void` | Fired when the input's value changes. |

| Data attribute | | Description |
| --- | --- | --- |
| `data-disabled` | | Present when the input is disabled. |
| `data-valid` | | Present when the input is in a valid state. |
| `data-invalid` | | Present when the input is in an invalid state. |
| `data-touched` | | Present when the input has been touched. |
| `data-dirty` | | Present when the input's value has changed. |
| `data-filled` | | Present when the input contains a value. |
| `data-focused` | | Present when the input is focused. |
