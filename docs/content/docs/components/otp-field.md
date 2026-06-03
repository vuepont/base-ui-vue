---
title: OTP Field
description: A high-quality, unstyled Vue one-time-password field with one input per character.
---

# OTP Field

A sequence of single-character inputs for entering one-time passwords and verification codes.

<ComponentPreview name="OtpField" />

## Introduction

`OtpField` renders one input per character and keeps them in sync with a single value. It handles
focus movement between slots, pasting a full code at once, keyboard navigation, masking, validation
filtering, and optional auto-submit when the value becomes complete. It integrates with
[Field](/docs/components/field) for labelling, validation, and form submission.

## Anatomy

Import the components and assemble them. Render one `OtpFieldInput` for every slot up to `length`:

```vue title="Anatomy"
<script setup>
import { OtpFieldInput, OtpFieldRoot } from 'base-ui-vue'

const OTP_LENGTH = 6
</script>

<template>
  <OtpFieldRoot :length="OTP_LENGTH">
    <OtpFieldInput v-for="i in OTP_LENGTH" :key="i" />
  </OtpFieldRoot>
</template>
```

## Validation type

Use the `validation-type` prop to constrain which characters are accepted. Accepted values are
`numeric` (default), `alpha`, `alphanumeric`, and `none`. Rejected characters emit `value-invalid`:

```vue
<OtpFieldRoot :length="6" validation-type="alphanumeric">
  <OtpFieldInput v-for="i in 6" :key="i" />
</OtpFieldRoot>
```

## Masking

Set `mask` to hide entered characters, rendering each slot as a password input:

```vue
<OtpFieldRoot :length="6" mask>
  <OtpFieldInput v-for="i in 6" :key="i" />
</OtpFieldRoot>
```

## Auto-submit

Set `auto-submit` to submit the owning form automatically once every slot is filled:

```vue
<OtpFieldRoot :length="6" auto-submit>
  <OtpFieldInput v-for="i in 6" :key="i" />
</OtpFieldRoot>
```

## API reference

### Root

Groups all OTP field parts and manages their state. Renders a `<div>` element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `length` | `number` | -- | The number of OTP input slots. Must match the number of rendered `OtpFieldInput` parts. |
| `value` | `string` | -- | The controlled OTP value. |
| `defaultValue` | `string` | -- | The uncontrolled initial value. |
| `validationType` | `'numeric' \| 'alpha' \| 'alphanumeric' \| 'none'` | `'numeric'` | The type of input validation applied to the value. |
| `normalizeValue` | `(value: string) => string` | -- | Idempotent normalizer applied after whitespace and validation filtering. |
| `mask` | `boolean` | `false` | Whether slot inputs should mask entered characters. |
| `autoSubmit` | `boolean` | `false` | Whether to submit the owning form when the value becomes complete. |
| `autoComplete` | `string` | `'one-time-code'` | Autocomplete hint applied to the first slot and hidden input. |
| `inputMode` | `string` | -- | Virtual keyboard hint. Defaults based on `validationType`. |
| `name` | `string` | -- | Identifies the field when a form is submitted. |
| `form` | `string` | -- | The id of the `form` element to associate the hidden input with. |
| `disabled` | `boolean` | `false` | Whether the component should ignore user interaction. |
| `readOnly` | `boolean` | `false` | Whether the user is unable to change the value. |
| `required` | `boolean` | `false` | Whether a value is required before submitting a form. |
| `as` | `string \| Component` | `'div'` | The element or component to render. |
| `class` | `string \| ((state: State) => string)` | -- | CSS class applied to the element. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | -- | Style applied to the element. |

| Emit | Arguments | Description |
| --- | --- | --- |
| `value-change` | `(value: string, eventDetails)` | Fired when the OTP value changes. |
| `value-complete` | `(value: string, eventDetails)` | Fired when the value becomes complete. |
| `value-invalid` | `(value: string, eventDetails)` | Fired when typed/pasted text contains rejected characters. |

| Data attribute | | Description |
| --- | --- | --- |
| `data-valid` | | Present when the field is valid. |
| `data-invalid` | | Present when the field is invalid. |
| `data-disabled` | | Present when the field is disabled. |
| `data-readonly` | | Present when the field is read-only. |
| `data-required` | | Present when the field is required. |
| `data-complete` | | Present when every slot is filled. |
| `data-filled` | | Present when the field has a value. |
| `data-focused` | | Present when a slot is focused. |
| `data-touched` | | Present after the field has been touched. |
| `data-dirty` | | Present when the value differs from the initial value. |

### Input

An individual OTP character input. Renders an `<input>` element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'input'` | The element or component to render. |
| `class` | `string \| ((state: State) => string)` | -- | CSS class applied to the element. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | -- | Style applied to the element. |

| Data attribute | | Description |
| --- | --- | --- |
| `data-valid` | | Present when the field is valid. |
| `data-invalid` | | Present when the field is invalid. |
| `data-disabled` | | Present when the field is disabled. |
| `data-readonly` | | Present when the field is read-only. |
| `data-required` | | Present when the field is required. |
| `data-complete` | | Present when every slot is filled. |
| `data-filled` | | Present when this slot contains a character. |
| `data-focused` | | Present when a slot is focused. |
