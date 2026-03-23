---
title: Fieldset
description: A high-quality, unstyled Vue fieldset component with an easily stylable legend.
---

# Fieldset

A native fieldset element with an easily stylable legend.

<ComponentPreview name="Fieldset" />

## Anatomy

Import the component and assemble its parts:

```vue title="Anatomy"
<script setup>
import { FieldsetLegend, FieldsetRoot } from 'base-ui-vue'
</script>

<template>
  <FieldsetRoot>
    <FieldsetLegend />
  </FieldsetRoot>
</template>
```

## API reference

### Root

Groups a shared legend with related controls. Renders a `<fieldset>` element.

| Prop       | Type                                           | Default      | Description                                                                                             |
| ---------- | ---------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `as`       | `string \| Component`                          | `'fieldset'` | The element or component to use for the root node.                                                      |
| `disabled` | `boolean`                                      | `false`      | Whether the component should ignore user interaction.                                                   |
| `class`    | `string \| ((state: State) => string)`         | —            | CSS class applied to the element, or a function that returns a class based on the component's state.    |
| `style`    | `StyleValue \| ((state: State) => StyleValue)` | —            | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute       | Description                            |
| --------------- | -------------------------------------- |
| `data-disabled` | Present when the fieldset is disabled. |

### Legend

An accessible label that is automatically associated with the fieldset. Renders a `<div>` element.

| Prop    | Type                                           | Default | Description                                                                                             |
| ------- | ---------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `as`    | `string \| Component`                          | `'div'` | The element or component to use for the root node.                                                      |
| `id`    | `string`                                       | —       | The `id` attribute of the legend element. When set, overrides the auto-generated id.                    |
| `class` | `string \| ((state: State) => string)`         | —       | CSS class applied to the element, or a function that returns a class based on the component's state.    |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | —       | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute       | Description                            |
| --------------- | -------------------------------------- |
| `data-disabled` | Present when the fieldset is disabled. |
