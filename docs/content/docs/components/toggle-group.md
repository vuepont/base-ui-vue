---
title: Toggle Group
description: A high-quality, unstyled Vue toggle group component that provides shared state to a series of toggle buttons.
---

# Toggle Group

Provides a shared state to a series of toggle buttons.

<ComponentPreview name="ToggleGroup" />

## Anatomy

Toggle Group is composed together with [Toggle](/docs/components/toggle). Import the components and place them together:

```vue title="Anatomy"
<script setup lang="ts">
import { Toggle, ToggleGroup } from 'base-ui-vue'
</script>

<template>
  <ToggleGroup>
    <Toggle value="left" />
    <Toggle value="center" />
    <Toggle value="right" />
  </ToggleGroup>
</template>
```

## Examples

### Multiple

Add the `multiple` prop to allow pressing more than one toggle at a time.

<ComponentPreview name="ToggleGroupMultiple" />

## API reference

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | The element or component to use for the root node. |
| `value` | `string[]` | `undefined` | The pressed values of the toggle group. This is the controlled counterpart of `default-value`. |
| `default-value` | `string[]` | `undefined` | The pressed values of the toggle group. This is the uncontrolled counterpart of `value`. |
| `disabled` | `boolean` | `false` | Whether the toggle group should ignore user interaction. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | The orientation of the toggle group. |
| `loop-focus` | `boolean` | `true` | Whether keyboard navigation loops back to the first item after the last item. |
| `multiple` | `boolean` | `false` | Whether more than one toggle can be pressed at the same time. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Emits | Type | Description |
| ----- | ---- | ----------- |
| `value-change` | `(value: string[], details: EventDetails) => void` | Emitted when the pressed values change. |

| Attribute | Description |
| --------- | ----------- |
| `data-disabled` | Present when the toggle group is disabled. |
| `data-orientation` | Indicates the orientation of the toggle group. |
| `data-multiple` | Present when the toggle group allows multiple pressed toggles. |
