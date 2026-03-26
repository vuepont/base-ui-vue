---
title: Checkbox Group
description: A high-quality, unstyled Vue checkbox group component that provides shared state for a series of checkboxes.
---

# Checkbox Group

Provides shared state to a series of checkboxes.

<ComponentPreview name="CheckboxGroup" />

## Usage guidelines

- Checkbox groups need an accessible name. Use `aria-labelledby`, [Field](/docs/components/field), or [Fieldset](/docs/components/fieldset) so assistive technologies can describe the whole group.

## Anatomy

`CheckboxGroup` is composed together with [Checkbox](/docs/components/checkbox):

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

Use a visible label and wire it through `aria-labelledby`:

```vue title="Using aria-labelledby to label a checkbox group"
<div id="protocols-label">
Allowed network protocols
</div>

<CheckboxGroup aria-labelledby="protocols-label">
  <!-- checkboxes -->
</CheckboxGroup>
```

Each checkbox can still be labeled with a wrapping label:

```vue title="Wrapping each checkbox in a label"
<label>
  <CheckboxRoot value="http" />
  HTTP
</label>
```

### Form integration

Use [Field](/docs/components/field) and [Fieldset](/docs/components/fieldset) when the group participates in form submission:

```vue title="Using CheckboxGroup in a form"
<script setup lang="ts">
import {
  CheckboxGroup,
  CheckboxIndicator,
  CheckboxRoot,
  FieldItem,
  FieldLabel,
  FieldRoot,
  FieldsetLegend,
  FieldsetRoot,
  Form,
} from 'base-ui-vue'
</script>

<template>
  <Form>
    <FieldRoot name="allowedNetworkProtocols">
      <FieldsetRoot as="div">
        <FieldsetLegend>Allowed network protocols</FieldsetLegend>
        <CheckboxGroup>
          <FieldItem>
            <FieldLabel>
              <CheckboxRoot value="http">
                <CheckboxIndicator />
              </CheckboxRoot>
              HTTP
            </FieldLabel>
          </FieldItem>
        </CheckboxGroup>
      </FieldsetRoot>
    </FieldRoot>
  </Form>
</template>
```

### Parent checkbox

You can build a checkbox that controls the other checkboxes in the group:

1. Make `CheckboxGroup` controlled with `value` and `@value-change`.
2. Pass every child value to `all-values`.
3. Add the `parent` prop to the controlling `CheckboxRoot`.

<ComponentPreview name="CheckboxGroupParent" />

### Nested parent checkbox

Nested groups can use the same pattern for cascading selection:

<ComponentPreview name="CheckboxGroupNested" />

## API reference

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | The element or component used for the group root. |
| `value` | `string[]` | `undefined` | Controlled list of selected checkbox values. |
| `default-value` | `string[]` | `[]` | Uncontrolled initial list of selected checkbox values. |
| `all-values` | `string[]` | `[]` | All child checkbox values. Required for `parent` checkbox behavior. |
| `disabled` | `boolean` | `false` | Whether every checkbox in the group should ignore user interaction. |

Events:

- `@value-change="(value, details) => {}"` fires when the selected values change.

Attributes:

- `data-disabled`
