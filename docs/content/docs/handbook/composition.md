---
title: Composition
description: Learn how to compose Base UI Vue components with your own Vue components.
---

# Composition

A guide to composing Base UI Vue components with your own Vue components.

## Composing custom Vue components

Use the `as` prop, `Slot`, or [useRender](/docs/utils/use-render) to compose a Base UI Vue part with your own components.

For example, [Button](/docs/components/button) renders a `<button>` by default. The code snippet below shows how to use a custom component instead.

```vue title="button-trigger.vue"
<script setup lang="ts">
import { Button } from 'base-ui-vue'
import MyButton from './MyButton.vue'
</script>

<template>
  <Button :as="MyButton">
    Save
  </Button>
</template>
```

The custom component should forward fallthrough attributes and refs to the underlying DOM element or component part that needs them.

## Composing multiple components

In situations where you need to compose multiple Base UI Vue components together, the same pattern can be nested as deeply as necessary.

```vue title="nested-composition.vue"
<script setup lang="ts">
import {
  Button,
  FieldControl,
  FieldDescription,
  FieldLabel,
  FieldRoot,
  FieldsetLegend,
  FieldsetRoot,
  Form,
  mergeProps,
  Slot,
} from 'base-ui-vue'
import MyButton from './MyButton.vue'
import MyFieldContainer from './MyFieldContainer.vue'
import MyFormSection from './MyFormSection.vue'
import MyLegend from './MyLegend.vue'
import MyTextarea from './MyTextarea.vue'
</script>

<template>
  <Form :as="MyFormSection">
    <FieldsetRoot :as="MyFormSection">
      <FieldsetLegend :as="MyLegend">
        Profile
      </FieldsetLegend>

      <FieldRoot :as="MyFieldContainer" name="bio">
        <FieldLabel>Bio</FieldLabel>
        <FieldControl :as="MyTextarea" />
        <FieldDescription>
          Visible on your public profile.
        </FieldDescription>
      </FieldRoot>

      <Button v-slot="{ props, ref }" :as="Slot">
        <MyButton
          :ref="ref"
          v-bind="mergeProps(props, {
            type: 'submit',
            class: 'PrimaryButton',
          })"
        >
          Save profile
        </MyButton>
      </Button>
    </FieldsetRoot>
  </Form>
</template>
```

This is where [useRender](/docs/utils/use-render) and [mergeProps](/docs/utils/merge-props) become important: `as` lets you swap component parts, `Slot` lets you take over the rendered markup, and `mergeProps` keeps the combined props and listeners intact.

## Changing the default rendered element

Many parts can render a different HTML element or Vue component through the `as` prop.

For example, [FieldControl](/docs/components/field) renders an `<input>` by default, but can render another compatible control element when needed.

```vue title="field-control-textarea.vue"
<script setup lang="ts">
import { FieldControl, FieldRoot } from 'base-ui-vue'
</script>

<template>
  <FieldRoot>
    <FieldControl as="textarea" />
  </FieldRoot>
</template>
```

Each Base UI Vue component renders the most appropriate element by default, and in most cases rendering a different element is best kept to specific integration needs.

## Renderless composition

When you need full control over the rendered markup, pass `Slot` to `as` and use the scoped slot payload to bind Base UI Vue props yourself.

```vue title="renderless-button.vue"
<script setup lang="ts">
import { Button, mergeProps, Slot } from 'base-ui-vue'
</script>

<template>
  <Button v-slot="{ props, ref }" :as="Slot">
    <span :ref="ref" v-bind="mergeProps(props, { class: 'ButtonText' })">
      Save
    </span>
  </Button>
</template>
```

This pattern gives you complete control over the rendered structure while keeping Base UI Vue's internal props, listeners, refs, and state attributes intact.
