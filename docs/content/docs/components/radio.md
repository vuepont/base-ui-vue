---
title: Radio
description: A high-quality, unstyled Vue radio button component that is easy to customize.
---

# Radio

An easily stylable radio button component.

<ComponentPreview name="Radio" />

## Usage guidelines

- **Radio buttons must be grouped**: Use `RadioGroup` to provide shared value state, keyboard navigation, and form behavior.
- **Form controls must have an accessible name**: Label the group with `aria-labelledby`, `Fieldset`, or `Field`, and label each radio with a `<label>` element. See the [forms guide](/docs/handbook/forms).

## Anatomy

Import the radio parts and compose them with a group:

```vue title="Anatomy"
<script setup lang="ts">
import { RadioGroup, RadioIndicator, RadioRoot } from 'base-ui-vue'
</script>

<template>
  <RadioGroup default-value="ssd">
    <RadioRoot value="ssd">
      <RadioIndicator />
    </RadioRoot>
  </RadioGroup>
</template>
```

## Examples

### Labeling a radio group

Label the group with `aria-labelledby` and a sibling label element:

```vue title="Using aria-labelledby to label a radio group"
<div id="storage-type-label">
  Storage type
</div>

<RadioGroup aria-labelledby="storage-type-label">
  <!-- radio options -->
</RadioGroup>
```

An enclosing `<label>` is the simplest labeling pattern for each radio:

```vue{2,5} title="Using an enclosing label to label a radio button"
<RadioGroup default-value="ssd">
  <label>
    <RadioRoot value="ssd" />
    SSD
  </label>
</RadioGroup>
```

### Rendering as a native button

By default, `RadioRoot` renders a `<span>` element to support enclosing labels. Prefer rendering each radio as a native button when using sibling labels (`for`/`id`).

```vue title="Sibling label pattern with a native button"
<div id="storage-type">
  Storage type
</div>

<RadioGroup default-value="ssd" aria-labelledby="storage-type">
  <div>
    <label for="storage-type-ssd">SSD</label>
    <RadioRoot
      value="ssd"
      id="storage-type-ssd"
      as="button"
      :native-button="true"
    >
      <RadioIndicator />
    </RadioRoot>
  </div>
</RadioGroup>
```

Native buttons with wrapping labels are supported by using renderless mode so the hidden input is placed outside the label:

```vue{8-17} title="Renderless native button"
<script setup lang="ts">
import { RadioGroup, RadioIndicator, RadioRoot, Slot } from 'base-ui-vue'
</script>

<template>
  <RadioGroup default-value="ssd">
    <RadioRoot value="ssd" :as="Slot" :native-button="true" v-slot="{ props, ref }">
      <label>
        <button :ref="ref" v-bind="props">
          <RadioIndicator />
        </button>
        SSD
      </label>
    </RadioRoot>
  </RadioGroup>
</template>
```

### Form integration

Use [Field](/docs/components/field) and [Fieldset](/docs/components/fieldset) for group labeling and form integration:

```vue title="Using Radio in a form"
<script setup lang="ts">
import {
  FieldRoot,
  FieldsetLegend,
  FieldsetRoot,
  Form,
  RadioGroup,
  RadioRoot,
} from 'base-ui-vue'
</script>

<template>
  <Form>
    <FieldRoot name="storageType">
      <FieldsetRoot :as="RadioGroup" default-value="ssd">
        <FieldsetLegend>Storage type</FieldsetLegend>
        <label>
          <RadioRoot value="ssd" />
          SSD
        </label>
        <label>
          <RadioRoot value="hdd" />
          HDD
        </label>
      </FieldsetRoot>
    </FieldRoot>
  </Form>
</template>
```

## API reference

### Group

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | The element or component used for the radio group. |
| `value` | `Value` | `undefined` | The controlled selected radio value. To render an uncontrolled group, use `default-value` instead. |
| `default-value` | `Value` | `undefined` | The initially selected radio value. To render a controlled group, use `value` instead. |
| `disabled` | `boolean` | `false` | Whether the group should ignore user interaction. |
| `read-only` | `boolean` | `false` | Whether the user should be unable to select a different radio. |
| `required` | `boolean` | `false` | Whether the user must choose a value before submitting a form. |
| `name` | `string` | `undefined` | Identifies the field when a form is submitted. |
| `form` | `string` | `undefined` | Identifies the form that owns the radio inputs. Useful when the group is rendered outside the form. |
| `input-ref` | `any` | `undefined` | A ref or callback to access the currently selected hidden input element. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Emits | Type | Description |
| ----- | ---- | ----------- |
| `value-change` | `(value: Value, details: EventDetails) => void` | Emitted when the selected radio value changes. |

| Attribute | Description |
| --------- | ----------- |
| `data-disabled` | Present when the radio group is disabled. |
| `data-readonly` | Present when the radio group is read-only. |
| `data-required` | Present when the radio group is required. |
| `data-valid` | Present when the radio group is valid. |
| `data-invalid` | Present when the radio group is invalid. |
| `data-dirty` | Present when the radio group's value has changed. |
| `data-touched` | Present when the radio group has been touched. |
| `data-filled` | Present when a radio value is selected. |
| `data-focused` | Present when focus is inside the radio group. |

### Root

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'span'` | The element or component used for the radio root. |
| `value` | `Value` | - | The unique identifying value of the radio in a group. |
| `disabled` | `boolean` | `false` | Whether the component should ignore user interaction. |
| `read-only` | `boolean` | `false` | Whether the user should be unable to select the radio button. |
| `required` | `boolean` | `false` | Whether the user must choose a value before submitting a form. |
| `input-ref` | `any` | `undefined` | A ref or callback to access the hidden `<input>` element. |
| `native-button` | `boolean` | `false` | Whether the component renders a native `<button>` element when replacing it via the `as` prop. Set to `true` if the rendered element is a native button. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute | Description |
| --------- | ----------- |
| `data-checked` | Present when the radio is checked. |
| `data-unchecked` | Present when the radio is unchecked. |
| `data-disabled` | Present when the radio is disabled. |
| `data-readonly` | Present when the radio is read-only. |
| `data-required` | Present when the radio is required. |
| `data-valid` | Present when the radio is valid. |
| `data-invalid` | Present when the radio is invalid. |
| `data-dirty` | Present when the radio's value has changed. |
| `data-touched` | Present when the radio has been touched. |
| `data-filled` | Present when the radio is checked. |
| `data-focused` | Present when the radio is focused. |

### Indicator

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'span'` | The element or component used for the indicator. |
| `keep-mounted` | `boolean` | `false` | Whether to keep the element in the DOM when the radio button is inactive. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute | Description |
| --------- | ----------- |
| `data-checked` | Present when the radio is checked. |
| `data-unchecked` | Present when the radio is unchecked. |
| `data-disabled` | Present when the radio is disabled. |
| `data-readonly` | Present when the radio is read-only. |
| `data-required` | Present when the radio is required. |
| `data-valid` | Present when the radio is valid. |
| `data-invalid` | Present when the radio is invalid. |
| `data-dirty` | Present when the radio's value has changed. |
| `data-touched` | Present when the radio has been touched. |
| `data-filled` | Present when the radio is checked. |
| `data-focused` | Present when the radio is focused. |
| `data-starting-style` | Present when the indicator is animating in. |
| `data-ending-style` | Present when the indicator is animating out. |
