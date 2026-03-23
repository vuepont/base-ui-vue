# Forms

A guide to building forms with Base UI Vue components.

Base UI Vue form components extend native form behavior so you can build accessible forms for collecting user input or configuring an interface. The current Vue package also supports custom validation flows and higher-level form submission through [Form](/docs/components/form), [Field](/docs/components/field), and [Fieldset](/docs/components/fieldset).

## Naming form controls

Form controls need an accessible name so assistive technologies can identify them correctly.

### Input controls

Use [FieldLabel](/docs/components/field) or a native `<label>` to label controls such as:

- text inputs rendered through `FieldControl`
- [Button](/docs/components/button) when it submits a form action
- any custom control composed inside [Field](/docs/components/field)

### Trigger-based controls

When the control is not a plain input, keep the visible label close to the interactive part and wire it through [Field](/docs/components/field) or [Fieldset](/docs/components/fieldset) so the labeling relationship remains explicit.

### Fallback

If no visible label is rendered, provide `aria-label` on the actual control element.

### Describing the control

[FieldDescription](/docs/components/field) gives a control an accessible description without manual `aria-describedby` wiring.

```vue title="field-description.vue"
<script setup lang="ts">
import {
  FieldControl,
  FieldDescription,
  FieldLabel,
  FieldRoot,
} from 'base-ui-vue'
</script>

<template>
  <FieldRoot>
    <FieldLabel>Email address</FieldLabel>
    <FieldControl type="email" />
    <FieldDescription>
      We'll only use this for account notifications.
    </FieldDescription>
  </FieldRoot>
</template>
```

### Labeling control groups

Use [Fieldset](/docs/components/fieldset) when a single label applies to multiple related controls.

```vue title="fieldset.vue"
<script setup lang="ts">
import { FieldsetLegend, FieldsetRoot } from 'base-ui-vue'
</script>

<template>
  <FieldsetRoot>
    <FieldsetLegend>Notification preferences</FieldsetLegend>
    <!-- related controls -->
  </FieldsetRoot>
</template>
```

## Building form fields

Use [Field](/docs/components/field) to keep the control, label, description, and error state together. Pass `name` to `FieldRoot` so the wrapped control participates in form submission.

```vue title="named-field.vue"
<script setup lang="ts">
import { FieldControl, FieldLabel, FieldRoot } from 'base-ui-vue'
</script>

<template>
  <FieldRoot name="email">
    <FieldLabel>Email address</FieldLabel>
    <FieldControl type="email" />
  </FieldRoot>
</template>
```

## Submitting data

You can handle submission with native `@submit`, or use Base UI Vue's higher-level `@form-submit` event.

```vue title="form-submit.vue"
<script setup lang="ts">
import { Form } from 'base-ui-vue'

async function handleFormSubmit(formValues: Record<string, unknown>) {
  await fetch('https://api.example.com', {
    method: 'POST',
    body: JSON.stringify(formValues),
  })
}
</script>

<template>
  <Form @form-submit="handleFormSubmit">
    <!-- fields -->
  </Form>
</template>
```

## Constraint validation

Base UI Vue supports native validation attributes such as `required`, `minlength`, `maxlength`, and `pattern` on form controls where they apply.

```vue title="constraint-validation.vue"
<script setup lang="ts">
import { FieldControl, FieldError, FieldRoot } from 'base-ui-vue'
</script>

<template>
  <FieldRoot name="website">
    <FieldControl type="url" required pattern="https?://.*" />
    <FieldError />
  </FieldRoot>
</template>
```

## Custom validation

Add synchronous or asynchronous validation with the `validate` prop on [FieldRoot](/docs/components/field). Use `validationMode` and `validationDebounceTime` to control when validation runs.

```vue title="custom-validation.vue"
<script setup lang="ts">
import { FieldControl, FieldError, FieldRoot } from 'base-ui-vue'

async function validateUsername(value: unknown) {
  if (typeof value !== 'string' || value.length < 3) {
    return 'Username must be at least 3 characters long.'
  }

  return null
}
</script>

<template>
  <FieldRoot
    name="username"
    validation-mode="onChange"
    :validation-debounce-time="300"
    :validate="validateUsername"
  >
    <FieldControl />
    <FieldError />
  </FieldRoot>
</template>
```

## Server-side validation

When your server or schema layer returns field errors, pass them to [Form](/docs/components/form) through the `errors` prop.

## Displaying errors

Use [FieldError](/docs/components/field) and [FieldValidity](/docs/components/field) to render validation feedback close to the control without wiring every validity attribute by hand.
