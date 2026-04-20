---
title: Meter
description: A high-quality, unstyled Vue meter component that displays a scalar measurement within a known range.
---

# Meter

A graphical display of a scalar value within a known range, accessible to screen readers.

<ComponentPreview name="Meter" />

## Usage guidelines

- **Use `Meter` for static, already-known measurements** (disk usage, battery level, storage quota). For task progress that changes over time, prefer `Progress`.
- **Provide an accessible name** via `<MeterLabel>` or `aria-label` / `aria-labelledby` on `<MeterRoot>`. Without a label, screen readers fall back to the raw numeric value.
- **The default `value` is treated as a percentage** (0–100). When `format` is supplied, the raw `value` is passed to `Intl.NumberFormat` instead; make sure `min` / `max` still describe the same scale.

## Anatomy

Import the component and assemble its parts:

```vue title="Anatomy"
<script setup lang="ts">
import {
  MeterIndicator,
  MeterLabel,
  MeterRoot,
  MeterTrack,
  MeterValue,
} from 'base-ui-vue'
</script>

<template>
  <MeterRoot :value="24">
    <MeterLabel>Storage Used</MeterLabel>
    <MeterValue />
    <MeterTrack>
      <MeterIndicator />
    </MeterTrack>
  </MeterRoot>
</template>
```

## Examples

### Formatting the value

Pass `Intl.NumberFormat` options via the `format` prop to render the raw `value` in a different unit. When `format` is provided, the same formatted string is also used as `aria-valuetext`:

```vue title="Meter with currency formatting"
<MeterRoot :value="1200" :max="2000" :format="{ style: 'currency', currency: 'USD' }">
  <MeterLabel>Monthly spend</MeterLabel>
  <MeterValue />
  <MeterTrack>
    <MeterIndicator />
  </MeterTrack>
</MeterRoot>
```

### Custom screen-reader text

Use `get-aria-value-text` to produce a human-readable announcement for assistive technology. It receives the formatted value and the raw value, and is preferred over writing a fixed `aria-valuetext`:

```vue title="Meter with custom aria-valuetext"
<MeterRoot
  :value="32"
  :get-aria-value-text="(formatted, value) => `${formatted} of daily quota used`"
>
  <MeterLabel>Daily quota</MeterLabel>
  <MeterTrack>
    <MeterIndicator />
  </MeterTrack>
</MeterRoot>
```

### Custom value rendering

`MeterValue` exposes the formatted and raw values through its default slot so you can compose richer layouts:

```vue title="Meter with custom value rendering"
<MeterValue v-slot="{ formattedValue, value }">
  <strong>{{ formattedValue }}</strong>
  <span v-if="value < 20"> — low</span>
</MeterValue>
```

## API reference

### Root

Groups all parts of the meter and provides the value for screen readers.
Renders a `<div>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `number` | — | The current value of the meter. Required. |
| `min` | `number` | `0` | The minimum allowed value of the meter. |
| `max` | `number` | `100` | The maximum allowed value of the meter. |
| `format` | `Intl.NumberFormatOptions` | `undefined` | Options to format the value. When omitted, the value is formatted as a percentage of 100. |
| `locale` | `Intl.LocalesArgument` | `undefined` | The locale used by `Intl.NumberFormat` when formatting the value. Defaults to the user's runtime locale. |
| `aria-valuetext` | `string` | `undefined` | A string value that provides a user-friendly name for `aria-valuenow`. Takes precedence over `get-aria-value-text`. |
| `get-aria-value-text` | `(formattedValue: string, value: number) => string` | `undefined` | A function that returns a string value for `aria-valuetext`. |
| `as` | `string \| Component` | `'div'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute | Description |
| --------- | ----------- |
| `role` | Always `"meter"`. |
| `aria-valuenow` | Reflects the current `value`. |
| `aria-valuemin` | Reflects `min`. |
| `aria-valuemax` | Reflects `max`. |
| `aria-valuetext` | The human-readable value announced by screen readers. |
| `aria-labelledby` | Points to the `<MeterLabel>` id when one is rendered. |

### Label

An accessible label for the meter. Its id is automatically wired to the root's `aria-labelledby`.
Renders a `<span>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `id` | `string` | `undefined` | The id of the label element. When provided, it overrides the automatically generated one. |
| `as` | `string \| Component` | `'span'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

### Value

A text element displaying the current value. Hidden from assistive technology with `aria-hidden` because the root already exposes `aria-valuetext`.
Renders a `<span>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'span'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Slot prop | Type | Description |
| --------- | ---- | ----------- |
| `formatted-value` | `string` | The formatted current value of the meter. |
| `value` | `number` | The raw numeric current value. |

### Track

Contains the meter indicator.
Renders a `<div>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

### Indicator

Visualizes the current value of the meter. Its width is driven by `value` / `min` / `max`. Default styles set `inset-inline-start: 0`, `height: inherit` and `width: <percentage>%` — override them through `style` or `class`.
Renders a `<div>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |
