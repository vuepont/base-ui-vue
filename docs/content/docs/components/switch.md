---
title: Switch
description: A high-quality, unstyled Vue switch component that indicates whether a setting is on or off.
---

# Switch

A control that indicates whether a setting is on or off.

<ComponentPreview name="Switch" />

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See [Labeling a switch](#labeling-a-switch) and the [forms guide](/docs/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```vue title="Anatomy"
<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'base-ui-vue'
</script>

<template>
  <SwitchRoot>
    <SwitchThumb />
  </SwitchRoot>
</template>
```

## Examples

### Labeling a switch

An enclosing `<label>` is the simplest labeling pattern:

```vue{1,4} title="Wrapping a label around a switch"
<label>
  <SwitchRoot />
  Notifications
</label>
```

### Rendering as a native button

By default, `SwitchRoot` renders a `<span>` element to support enclosing labels. Prefer rendering the switch as a native button when using sibling labels (`for`/`id`).

```vue title="Sibling label pattern with a native button"
<div>
  <label for="notifications-switch">Notifications</label>
  <SwitchRoot
    id="notifications-switch"
    as="button"
    :native-button="true"
  >
    <SwitchThumb />
  </SwitchRoot>
</div>
```

Native buttons with wrapping labels are supported by using renderless mode so the hidden input is placed outside the label:

```vue{7-14} title="Render callback"
<script setup lang="ts">
import { Slot, SwitchRoot } from 'base-ui-vue'
</script>

<template>
  <SwitchRoot
    v-slot="{ props, ref }"
    :as="Slot"
    :native-button="true"
  >
    <label>
      <button :ref="ref" v-bind="props" />
      Notifications
    </label>
  </SwitchRoot>
</template>
```

### Form integration

Use [Field](/docs/components/field) to handle label associations and form integration:

```vue{13} title="Using Switch in a form"
<script setup lang="ts">
import {
  FieldLabel,
  FieldRoot,
  Form,
  SwitchRoot,
  SwitchThumb,
} from 'base-ui-vue'
</script>

<template>
  <Form>
    <FieldRoot name="notifications">
      <FieldLabel>
        <SwitchRoot>
          <SwitchThumb />
        </SwitchRoot>
        Notifications
      </FieldLabel>
    </FieldRoot>
  </Form>
</template>
```

## API reference

### Root

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'span'` | The element or component used for the switch root. |
| `checked` | `boolean` | `undefined` | Whether the switch is currently active. To render an uncontrolled switch, use the `default-checked` prop instead. |
| `default-checked` | `boolean` | `false` | Whether the switch is initially active. To render a controlled switch, use the `checked` prop instead. |
| `disabled` | `boolean` | `false` | Whether the component should ignore user interaction. |
| `read-only` | `boolean` | `false` | Whether the user should be unable to activate or deactivate the switch. |
| `required` | `boolean` | `false` | Whether the user must activate the switch before submitting a form. |
| `name` | `string` | `undefined` | Identifies the field when a form is submitted. |
| `form` | `string` | `undefined` | Identifies the form that owns the hidden input. Useful when the switch is rendered outside the form. |
| `value` | `string` | `undefined` | The value submitted with the form when the switch is on. By default, the switch submits `"on"`, matching native checkbox behavior. |
| `unchecked-value` | `string` | `undefined` | The value submitted with the form when the switch is off. By default, unchecked switches do not submit any value, matching native checkbox behavior. |
| `input-ref` | `any` | `undefined` | A ref or callback to access the hidden `<input>` element. |
| `native-button` | `boolean` | `false` | Whether the component renders a native `<button>` element when replacing it via the `as` prop. Set to `true` if the rendered element is a native button. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Emits | Type | Description |
| ----- | ---- | ----------- |
| `checked-change` | `(checked: boolean, details: EventDetails) => void` | Emitted when the switch is activated or deactivated. |

| Attribute | Description |
| --------- | ----------- |
| `data-checked` | Present when the switch is checked. |
| `data-unchecked` | Present when the switch is unchecked. |
| `data-disabled` | Present when the switch is disabled. |
| `data-readonly` | Present when the switch is read-only. |
| `data-required` | Present when the switch is required. |
| `data-valid` | Present when the switch is valid. |
| `data-invalid` | Present when the switch is invalid. |
| `data-dirty` | Present when the switch's value has changed. |
| `data-touched` | Present when the switch has been touched. |
| `data-filled` | Present when the switch is active. |
| `data-focused` | Present when the switch is focused. |

### Thumb

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'span'` | The element or component used for the switch thumb. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute | Description |
| --------- | ----------- |
| `data-checked` | Present when the switch is checked. |
| `data-unchecked` | Present when the switch is unchecked. |
| `data-disabled` | Present when the switch is disabled. |
| `data-readonly` | Present when the switch is read-only. |
| `data-required` | Present when the switch is required. |
| `data-valid` | Present when the switch is valid. |
| `data-invalid` | Present when the switch is invalid. |
| `data-dirty` | Present when the switch's value has changed. |
| `data-touched` | Present when the switch has been touched. |
| `data-filled` | Present when the switch is active. |
| `data-focused` | Present when the switch is focused. |
