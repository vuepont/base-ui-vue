---
title: Checkbox Group
description: A high-quality, unstyled Vue checkbox group component that provides shared state for a series of checkboxes.
---

# Checkbox Group

Provides shared state to a series of checkboxes.

<ComponentPreview name="CheckboxGroup" />

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using `<label>` elements, or the `Field` and `Fieldset` components. See [Labeling a checkbox group](#labeling-a-checkbox-group) and the [forms guide](/docs/handbook/forms).

## Anatomy

Checkbox Group is composed together with [Checkbox](/docs/components/checkbox). Import the components and place them together:

```vue title="Anatomy"
<script setup lang="ts">
import {
  CheckboxGroup,
  CheckboxIndicator,
  CheckboxRoot,
} from 'base-ui-vue'
</script>

<template>
  <CheckboxGroup>
    <CheckboxRoot>
      <CheckboxIndicator />
    </CheckboxRoot>
  </CheckboxGroup>
</template>
```

## Examples

### Labeling a checkbox group

Label the group with `aria-labelledby` and a sibling label element:

```vue title="Using aria-labelledby to label a checkbox group"
<div id="protocols-label">
Allowed network protocols
</div>

<CheckboxGroup aria-labelledby="protocols-label">
  <!-- checkboxes -->
</CheckboxGroup>
```

Each checkbox can still be labeled with a wrapping label:

```vue{1,4} title="Using an enclosing label to label a checkbox"
<label>
  <CheckboxRoot value="http" />
  HTTP
</label>
```

### Rendering as a native button

By default, `CheckboxRoot` renders a `<span>` element to support enclosing labels. Prefer rendering each checkbox as a native button when using sibling labels (`for`/`id`).

```vue title="Sibling label pattern with a native button"
<div id="protocols-label">
Allowed network protocols
</div>

<CheckboxGroup aria-labelledby="protocols-label">
  <div>
    <label for="protocol-http">HTTP</label>
    <CheckboxRoot
      id="protocol-http"
      value="http"
      as="button"
      :native-button="true"
    >
      <CheckboxIndicator />
    </CheckboxRoot>
  </div>
</CheckboxGroup>
```

Native buttons with wrapping labels are supported by using renderless mode so the hidden input is placed outside the label:

```vue{10-18} title="Render callback"
<script setup lang="ts">
import { CheckboxGroup, CheckboxRoot, Slot } from 'base-ui-vue'
</script>

<template>
  <div id="protocols-label">Allowed network protocols</div>

  <CheckboxGroup aria-labelledby="protocols-label">
    <CheckboxRoot
      v-slot="{ props, ref }"
      value="http"
      :as="Slot"
      :native-button="true"
    >
      <label>
        <button :ref="ref" v-bind="props" />
        HTTP
      </label>
    </CheckboxRoot>
  </CheckboxGroup>
</template>
```

### Form integration

Use [Field](/docs/components/field) and [Fieldset](/docs/components/fieldset) for group labeling and form integration:

```vue{17} title="Using CheckboxGroup in a form"
<script setup lang="ts">
import {
  CheckboxGroup,
  CheckboxIndicator,
  CheckboxRoot,
  FieldRoot,
  FieldsetLegend,
  FieldsetRoot,
  Form,
  FieldItem,
  FieldLabel,
} from 'base-ui-vue'
</script>

<template>
  <Form>
    <FieldRoot name="allowedNetworkProtocols">
      <FieldsetRoot as="div" :render="CheckboxGroup">
        <FieldsetLegend>Allowed network protocols</FieldsetLegend>
        <FieldItem>
          <FieldLabel>
            <CheckboxRoot value="http">
              <CheckboxIndicator />
            </CheckboxRoot>
            HTTP
          </FieldLabel>
        </FieldItem>
        <FieldItem>
          <FieldLabel>
            <CheckboxRoot value="https">
              <CheckboxIndicator />
            </CheckboxRoot>
            HTTPS
          </FieldLabel>
        </FieldItem>
        <FieldItem>
          <FieldLabel>
            <CheckboxRoot value="ssh">
              <CheckboxIndicator />
            </CheckboxRoot>
            SSH
          </FieldLabel>
        </FieldItem>
      </FieldsetRoot>
    </FieldRoot>
  </Form>
</template>
```

### Parent checkbox

You can build a checkbox that controls the other checkboxes in the group:

1. Make `CheckboxGroup` a controlled component.
2. Pass an array of all the child checkbox values to the `all-values` prop on the `CheckboxGroup` component.
3. Add the `parent` boolean prop to the parent `CheckboxRoot`.

The group controls the parent checkbox's [indeterminate](/docs/components/checkbox#checkboxroot) state when some, but not all, child checkboxes are checked.

<ComponentPreview name="CheckboxGroupParent" />

### Nested parent checkbox

Nested groups can use the same pattern for cascading selection:

<ComponentPreview name="CheckboxGroupNested" />

## API reference

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | The element or component used for the group root. |
| `value` | `string[]` | `undefined` | Names of the checkboxes in the group that should be ticked. To render an uncontrolled checkbox group, use the `default-value` prop instead. |
| `default-value` | `string[]` | `[]` | Names of the checkboxes in the group that should be initially ticked. To render a controlled checkbox group, use the `value` prop instead. |
| `all-values` | `string[]` | `[]` | Names of all checkboxes in the group. Use this when creating a parent checkbox. |
| `disabled` | `boolean` | `false` | Whether the component should ignore user interaction. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Emits | Type | Description |
| ----- | ---- | ----------- |
| `value-change` | `(value: string[], details: EventDetails) => void` | Emitted when a checkbox in the group is ticked or unticked. Provides the new value as an argument. |

| Attribute | Description |
| --------- | ----------- |
| `data-disabled` | Present when the checkbox group is disabled. |
| `data-valid` | Present when the checkbox group is valid. |
| `data-invalid` | Present when the checkbox group is invalid. |
| `data-dirty` | Present when the checkbox group's value has changed. |
| `data-touched` | Present when the checkbox group has been touched. |
| `data-filled` | Present when the checkbox group has a selected value. |
| `data-focused` | Present when a checkbox in the group is focused. |
