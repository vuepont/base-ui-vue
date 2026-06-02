---
title: Number Field
description: A high-quality, unstyled Vue number field component for entering and adjusting numeric values with buttons, keyboard, wheel, and scrubbing.
---

# Number Field

A component for entering and adjusting numeric values, with support for stepper buttons, keyboard interactions, locale-aware formatting, and pointer scrubbing.

<ComponentPreview name="NumberField" />

## Introduction

`NumberField` parses and formats numbers using the [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) API, supporting currencies, percentages, units, and locale-specific grouping and decimal separators. When placed inside a [Field](/docs/components/field), it gains labeling, validation, and state management automatically.

## Anatomy

Import the parts and assemble them:

```vue title="Anatomy"
<script setup>
import {
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
} from 'base-ui-vue'
</script>

<template>
  <NumberFieldRoot>
    <NumberFieldScrubArea>
      <NumberFieldScrubAreaCursor />
    </NumberFieldScrubArea>
    <NumberFieldGroup>
      <NumberFieldDecrement />
      <NumberFieldInput />
      <NumberFieldIncrement />
    </NumberFieldGroup>
  </NumberFieldRoot>
</template>
```

## Controlled value

Use the `value` prop together with the `@value-change` event to control the value:

```vue
<script setup>
import {
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
} from 'base-ui-vue'
import { ref } from 'vue'

const amount = ref(0)
</script>

<template>
  <NumberFieldRoot :value="amount" @value-change="(next) => (amount = next)">
    <NumberFieldGroup>
      <NumberFieldInput />
      <NumberFieldIncrement />
    </NumberFieldGroup>
  </NumberFieldRoot>
</template>
```

## Min, max, and step

Constrain the value with `min` and `max`, and control the increment amount with `step`. Hold <kbd>Alt</kbd> while stepping to use `smallStep`, or <kbd>Shift</kbd> to use `largeStep`.

```vue
<template>
  <NumberFieldRoot :min="0" :max="100" :step="5" :default-value="20">
    <NumberFieldGroup>
      <NumberFieldDecrement />
      <NumberFieldInput />
      <NumberFieldIncrement />
    </NumberFieldGroup>
  </NumberFieldRoot>
</template>
```

## Formatting

Pass [`Intl.NumberFormatOptions`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options) through the `format` prop and an optional `locale`:

```vue
<template>
  <NumberFieldRoot
    :default-value="1000"
    :format="{ style: 'currency', currency: 'USD' }"
    locale="en-US"
  >
    <NumberFieldGroup>
      <NumberFieldDecrement />
      <NumberFieldInput />
      <NumberFieldIncrement />
    </NumberFieldGroup>
  </NumberFieldRoot>
</template>
```

## Wheel scrubbing

Set `allowWheelScrub` to let users change the value by scrolling the wheel while the input is focused.

```vue
<template>
  <NumberFieldRoot allow-wheel-scrub :default-value="0">
    <NumberFieldGroup>
      <NumberFieldInput />
    </NumberFieldGroup>
  </NumberFieldRoot>
</template>
```

## API reference

### NumberFieldRoot

Groups all parts of the number field and manages its state. Renders a `<div>` element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'div'` | The element or component to render. |
| `value` | `number \| null` | -- | The controlled raw numeric value. |
| `defaultValue` | `number` | -- | The uncontrolled value when initially rendered. |
| `min` | `number` | -- | The minimum value. |
| `max` | `number` | -- | The maximum value. |
| `step` | `number \| 'any'` | `1` | Amount to step with buttons, arrow keys, and scrubbing. Use `'any'` to disable step validation. |
| `smallStep` | `number` | `0.1` | Step used while holding <kbd>Alt</kbd>. |
| `largeStep` | `number` | `10` | Step used while holding <kbd>Shift</kbd>. |
| `snapOnStep` | `boolean` | `false` | Whether to snap to the nearest step when stepping. |
| `allowOutOfRange` | `boolean` | `false` | Whether direct text entry may go outside `min`/`max` without clamping. |
| `allowWheelScrub` | `boolean` | `false` | Whether the value can be changed with the mouse wheel while focused. |
| `format` | `Intl.NumberFormatOptions` | -- | Options used to format the value. |
| `locale` | `Intl.LocalesArgument` | -- | The locale used to format and parse the value. |
| `name` | `string` | -- | Identifies the field when a form is submitted. |
| `form` | `string` | -- | The id of the form that owns the hidden input. |
| `id` | `string` | -- | The id of the input element. |
| `required` | `boolean` | `false` | Whether a value is required before submitting. |
| `disabled` | `boolean` | `false` | Whether the component should ignore user interaction. |
| `readOnly` | `boolean` | `false` | Whether the user is unable to change the value. |
| `class` | `string \| ((state: State) => string)` | -- | CSS class, or a function returning a class based on state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | -- | Style, or a function returning a style based on state. |

| Event | Type | Description |
| --- | --- | --- |
| `@value-change` | `(value: number \| null, eventDetails) => void` | Fired when the value changes. |
| `@value-committed` | `(value: number \| null, eventDetails) => void` | Fired when the value is committed (blur, pointer release, or keyboard). |

| Data attribute | Description |
| --- | --- |
| `data-disabled` | Present when disabled. |
| `data-readonly` | Present when read-only. |
| `data-required` | Present when required. |
| `data-scrubbing` | Present while scrubbing. |
| `data-valid` | Present when the field is valid. |
| `data-invalid` | Present when the field is invalid. |
| `data-touched` | Present when the field has been touched. |
| `data-dirty` | Present when the value has changed. |
| `data-filled` | Present when the field contains a value. |
| `data-focused` | Present when the field is focused. |

### NumberFieldGroup

Groups the input with the increment and decrement buttons. Renders a `<div>` element with `role="group"`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'div'` | The element or component to render. |
| `class` | `string \| ((state: State) => string)` | -- | CSS class, or a function returning a class based on state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | -- | Style, or a function returning a style based on state. |

### NumberFieldInput

The native input control. Renders an `<input>` element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'input'` | The element or component to render. |
| `class` | `string \| ((state: State) => string)` | -- | CSS class, or a function returning a class based on state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | -- | Style, or a function returning a style based on state. |

### NumberFieldIncrement

A stepper button that increases the value. Renders a `<button>` element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'button'` | The element or component to render. |
| `disabled` | `boolean` | `false` | Whether the button is disabled. |
| `nativeButton` | `boolean` | `true` | Whether the rendered element is a native `<button>`. |
| `class` | `string \| ((state: State) => string)` | -- | CSS class, or a function returning a class based on state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | -- | Style, or a function returning a style based on state. |

### NumberFieldDecrement

A stepper button that decreases the value. Renders a `<button>` element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'button'` | The element or component to render. |
| `disabled` | `boolean` | `false` | Whether the button is disabled. |
| `nativeButton` | `boolean` | `true` | Whether the rendered element is a native `<button>`. |
| `class` | `string \| ((state: State) => string)` | -- | CSS class, or a function returning a class based on state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | -- | Style, or a function returning a style based on state. |

### NumberFieldScrubArea

An interactive area where the user can click and drag to change the value. Renders a `<span>` element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'span'` | The element or component to render. |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Cursor movement direction. |
| `pixelSensitivity` | `number` | `2` | Pixels the cursor must move before the value changes. |
| `teleportDistance` | `number` | -- | Distance the cursor may move from center before looping back. |
| `class` | `string \| ((state: State) => string)` | -- | CSS class, or a function returning a class based on state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | -- | Style, or a function returning a style based on state. |

### NumberFieldScrubAreaCursor

A custom element shown instead of the native cursor while scrubbing. Renders a `<span>` element. Uses the [Pointer Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API) and is disabled in Safari.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'span'` | The element or component to render. |
| `class` | `string \| ((state: State) => string)` | -- | CSS class, or a function returning a class based on state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | -- | Style, or a function returning a style based on state. |
