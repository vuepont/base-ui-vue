---
title: Progress
description: A high-quality, unstyled Vue progress bar component that visualizes the completion status of a task.
---

# Progress

A progress bar component that communicates the completion status of a task to sighted users and screen readers.

<ComponentPreview name="Progress" />

## Usage guidelines

- **Use `Progress` for task completion that changes over time** (uploads, downloads, installations). For static measurements of a known range, prefer `Meter`.
- **Set `value` to `null` to render an indeterminate bar** for tasks whose completion rate is unknown. The root exposes the `data-indeterminate` attribute so you can style a looping animation in CSS.
- **Provide an accessible name** via `<ProgressLabel>` or `aria-label` / `aria-labelledby` on `<ProgressRoot>`. Without a label, screen readers only announce the raw percentage.
- **The default `value` is treated as a percentage** (0–100). When `format` is supplied, the raw `value` is passed to `Intl.NumberFormat` instead; make sure `min` / `max` still describe the same scale.

## Anatomy

Import the component and assemble its parts:

```vue title="Anatomy"
<script setup lang="ts">
import {
  ProgressIndicator,
  ProgressLabel,
  ProgressRoot,
  ProgressTrack,
  ProgressValue,
} from 'base-ui-vue'
</script>

<template>
  <ProgressRoot :value="40">
    <ProgressLabel>Export data</ProgressLabel>
    <ProgressValue />
    <ProgressTrack>
      <ProgressIndicator />
    </ProgressTrack>
  </ProgressRoot>
</template>
```

## Examples

### Indeterminate progress

Set `value` to `null` when the completion rate is not known. The root, track, and indicator all receive a `data-indeterminate` attribute that you can target from CSS:

```vue title="Indeterminate progress"
<ProgressRoot :value="null">
  <ProgressLabel>Syncing</ProgressLabel>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</ProgressRoot>
```

### Formatting the value

Pass `Intl.NumberFormat` options via the `format` prop to render the raw `value` in a different unit. When `format` is provided, the same formatted string is also used as `aria-valuetext`:

```vue title="Progress with custom formatting"
<ProgressRoot :value="750" :max="1000" :format="{ style: 'unit', unit: 'megabyte' }">
  <ProgressLabel>Uploaded</ProgressLabel>
  <ProgressValue />
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</ProgressRoot>
```

### Custom screen-reader text

Use `get-aria-value-text` to produce a human-readable announcement for assistive technology. It receives the formatted value (or `null` when indeterminate) and the raw value:

```vue title="Progress with custom aria-valuetext"
<ProgressRoot
  :value="60"
  :get-aria-value-text="(formatted, value) => value == null ? 'Still working…' : `${formatted} complete`"
>
  <ProgressLabel>Upload</ProgressLabel>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</ProgressRoot>
```

### Custom value rendering

`ProgressValue` exposes the formatted and raw values through its default slot. The `formattedValue` slot prop is the string `"indeterminate"` when the value is `null`:

```vue title="Progress with custom value rendering"
<ProgressRoot :value="80">
  <ProgressValue v-slot="{ formattedValue, value }">
    <strong v-if="value == null">working…</strong>
    <template v-else>
      <strong>{{ formattedValue }}</strong>
    </template>
  </ProgressValue>
</ProgressRoot>
```

## API reference

### Root

Groups all parts of the progress bar and provides the task completion status to screen readers.
Renders a `<div>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `number \| null` | — | The current value of the progress bar. Pass `null` for an indeterminate bar. Required. |
| `min` | `number` | `0` | The minimum allowed value. |
| `max` | `number` | `100` | The maximum allowed value. |
| `format` | `Intl.NumberFormatOptions` | `undefined` | Options to format the value. When omitted, the value is formatted as a percentage of 100. |
| `locale` | `Intl.LocalesArgument` | `undefined` | The locale used by `Intl.NumberFormat` when formatting the value. Defaults to the user's runtime locale. |
| `aria-valuetext` | `string` | `undefined` | A string value that provides a user-friendly name for `aria-valuenow`. Takes precedence over `get-aria-value-text`. |
| `get-aria-value-text` | `(formattedValue: string \| null, value: number \| null) => string` | `undefined` | A function that returns a string value for `aria-valuetext`. Receives `null` for the formatted value when indeterminate. |
| `as` | `string \| Component` | `'div'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| State prop | Type | Description |
| ---------- | ---- | ----------- |
| `status` | `'indeterminate' \| 'progressing' \| 'complete'` | The current status, derived from `value` / `max`. Exposed as a data attribute (see below). |

| Attribute | Description |
| --------- | ----------- |
| `role` | Defaults to `"progressbar"` (can be overridden by user attributes). |
| `aria-valuenow` | Reflects the current `value`. Omitted when indeterminate. |
| `aria-valuemin` | Defaults to `min` (can be overridden by user attributes). |
| `aria-valuemax` | Defaults to `max` (can be overridden by user attributes). |
| `aria-valuetext` | The human-readable value announced by screen readers. |
| `aria-labelledby` | Points to the `<ProgressLabel>` id when one is rendered. |
| `data-progressing` | Present while the value is between `min` and `max` (exclusive of `max`). |
| `data-complete` | Present when the value equals `max`. |
| `data-indeterminate` | Present when the value is `null` (or non-finite). |

### Label

An accessible label for the progress bar. Its id is automatically wired to the root's `aria-labelledby`.
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

When the progress is indeterminate, the default slot content is an empty string.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'span'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Slot prop | Type | Description |
| --------- | ---- | ----------- |
| `formattedValue` | `string \| 'indeterminate'` | The formatted current value. Equals the string `"indeterminate"` when the root value is `null`. |
| `value` | `number \| null` | The raw numeric current value, or `null` when indeterminate. |

### Track

Contains the progress indicator.
Renders a `<div>` element.

Must be rendered inside `<ProgressRoot>`, otherwise it throws at render time.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

### Indicator

Visualizes the completion status of the task. When determinate, its default styles set `inset-inline-start: 0`, `height: inherit`, and `width: <percentage>%`. When indeterminate, no inline styles are applied — use CSS to drive a looping animation (the `data-indeterminate` attribute is available on every Progress part).
Renders a `<div>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |
