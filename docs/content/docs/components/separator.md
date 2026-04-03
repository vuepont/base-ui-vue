---
title: Separator
description: A high-quality, unstyled Vue separator component that is accessible to screen readers.
---

# Separator

A separator element accessible to screen readers.

<ComponentPreview name="Separator" />

## Anatomy

Import the component and use it as a single part:

```vue title="Anatomy"
<script setup lang="ts">
import { Separator } from 'base-ui-vue'
</script>

<template>
  <Separator />
</template>
```

## API reference

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | The element or component to use for the root node. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | The orientation of the separator. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute | Description |
| --------- | ----------- |
| `data-orientation` | Indicates the separator orientation. |
