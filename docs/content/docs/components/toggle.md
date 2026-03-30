---
title: Toggle
description: A high-quality, unstyled Vue toggle component that displays a two-state button that can be on or off.
---

# Toggle

A two-state button that can be on or off.

<ComponentPreview name="Toggle" />

## Anatomy

Import the component:

```vue title="Anatomy"
<script setup lang="ts">
import { Toggle } from 'base-ui-vue'
</script>

<template>
  <Toggle />
</template>
```

## API reference

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'button'` | The element or component to use for the root node. |
| `pressed` | `boolean` | `undefined` | Whether the toggle button is currently pressed. This is the controlled counterpart of `default-pressed`. |
| `default-pressed` | `boolean` | `false` | Whether the toggle button is initially pressed. This is the uncontrolled counterpart of `pressed`. |
| `disabled` | `boolean` | `false` | Whether the component should ignore user interaction. |
| `value` | `string` | `undefined` | A unique string that identifies the toggle when used inside a toggle group. |
| `native-button` | `boolean` | `true` | Whether the component renders a native `<button>` element. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Emits | Type | Description |
| ----- | ---- | ----------- |
| `pressed-change` | `(pressed: boolean, details: EventDetails) => void` | Emitted when the pressed state changes. |

| Attribute | Description |
| --------- | ----------- |
| `data-pressed` | Present when the toggle button is pressed. |
| `data-disabled` | Present when the toggle button is disabled. |
