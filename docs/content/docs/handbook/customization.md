---
title: Customization
description: Learn how to customize the behavior of Base UI Vue components.
---

# Customization

A guide to customizing the behavior of Base UI Vue components.

## Base UI events

Change events such as `open-change`, `value-change`, and `form-submit` are custom to Base UI Vue. They can be emitted by user interaction, effects, or internal state changes depending on the component.

```ts title="Base UI Vue event signatures"
interface BaseUIEventHandlers {
  'open-change': (open: boolean, eventDetails: unknown) => void
  'value-change': (value: unknown, eventDetails: unknown) => void
  'form-submit': (formValues: Record<string, unknown>, event: Event) => void
}
```

Many Base UI Vue change handlers receive an `eventDetails` object as the second argument. This lets you inspect why a change happened and customize the default behavior without forcing every component into controlled mode.

```ts title="eventDetails object"
interface BaseUIChangeEventDetails {
  reason: string
  event: Event
  cancel: () => void
  allowPropagation: () => void
  isCanceled: boolean
  isPropagationAllowed: boolean
}
```

- `reason` tells you why the change occurred.
- `event` is the DOM event that triggered the change when one exists.
- `cancel()` stops the internal state change from happening.
- `allowPropagation()` allows the DOM event to bubble in cases where Base UI Vue would normally stop it.
- `isCanceled` tells you whether the change was canceled.
- `isPropagationAllowed` tells you whether DOM propagation has been re-enabled.

### Canceling a Base UI event

An event can be canceled with `eventDetails.cancel()`:

```vue title="prevent-collapsible-close.vue"
<script setup lang="ts">
import { CollapsibleRoot } from 'base-ui-vue'

function handleOpenChange(open: boolean, eventDetails: { reason: string, cancel: () => void }) {
  if (eventDetails.reason === 'trigger-press' && !open) {
    eventDetails.cancel()
  }
}
</script>

<template>
  <CollapsibleRoot @open-change="handleOpenChange">
    <!-- parts -->
  </CollapsibleRoot>
</template>
```

This lets you keep a component uncontrolled while still preventing specific internal state transitions.

### Allowing propagation of the DOM event

In some components, keyboard events like <kbd>Escape</kbd> are stopped so parent layers do not react at the same time. You can allow propagation again with `eventDetails.allowPropagation()` when a component exposes that detail object.

## Preventing Base UI from handling a Vue event

To prevent Base UI Vue from handling a merged listener such as `onClick`, use `event.preventBaseUIHandler()`:

```vue title="prevent-base-ui-handler.vue"
<script setup lang="ts">
import { mergeProps } from 'base-ui-vue'

const props = mergeProps(
  {
    onClick() {
      console.log('internal behavior')
    },
  },
  {
    onClick(event) {
      event.preventBaseUIHandler()
    },
  },
)
</script>

<template>
  <button v-bind="props">
    Click me
  </button>
</template>
```

This is an escape hatch for cases where there is not yet a dedicated prop for customizing the behavior.

## Controlling components with state

Components are uncontrolled by default, meaning they manage their own state internally.

```vue title="uncontrolled-collapsible.vue"
<script setup lang="ts">
import {
  CollapsiblePanel,
  CollapsibleRoot,
  CollapsibleTrigger,
} from 'base-ui-vue'
</script>

<template>
  <CollapsibleRoot>
    <CollapsibleTrigger>Details</CollapsibleTrigger>
    <CollapsiblePanel>
      Base UI Vue manages this open state internally.
    </CollapsiblePanel>
  </CollapsibleRoot>
</template>
```

A component becomes controlled when you pass external state to props like `open` or `value`, and update that state in the corresponding change handler.

```vue title="controlled-collapsible.vue"
<script setup lang="ts">
import {
  CollapsiblePanel,
  CollapsibleRoot,
  CollapsibleTrigger,
} from 'base-ui-vue'
import { ref } from 'vue'

const open = ref(false)

function handleOpenChange(nextOpen: boolean) {
  open.value = nextOpen
}
</script>

<template>
  <CollapsibleRoot :open="open" @open-change="handleOpenChange">
    <CollapsibleTrigger>Details</CollapsibleTrigger>
    <CollapsiblePanel>
      This open state is controlled externally.
    </CollapsiblePanel>
  </CollapsibleRoot>
</template>
```
