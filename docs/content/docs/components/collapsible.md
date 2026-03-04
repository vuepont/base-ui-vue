# Collapsible

A collapsible panel controlled by a button.

<ComponentPreview name="Collapsible" />

## Anatomy

Import the component and assemble its parts:

```vue title="Anatomy"
<script setup>
import { CollapsiblePanel, CollapsibleRoot, CollapsibleTrigger } from 'base-ui-vue'
</script>

<template>
  <CollapsibleRoot>
    <CollapsibleTrigger />
    <CollapsiblePanel />
  </CollapsibleRoot>
</template>
```

## Animations

The Collapsible panel can be animated using CSS transitions or CSS animations via the `--collapsible-panel-height` and `--collapsible-panel-width` CSS variables combined with `data-starting-style` and `data-ending-style` data attributes.

```css
.Panel {
  height: var(--collapsible-panel-height);
  overflow: hidden;
  transition: all 150ms ease-out;
}

.Panel[data-starting-style],
.Panel[data-ending-style] {
  height: 0;
}
```

## Controlled state

Use the `open` prop and `open-change` event for controlled behavior:

```vue
<script setup>
import { CollapsiblePanel, CollapsibleRoot, CollapsibleTrigger } from 'base-ui-vue'
import { ref } from 'vue'

const open = ref(false)

function handleOpenChange(value, details) {
  open.value = value
}
</script>

<template>
  <CollapsibleRoot :open="open" @open-change="handleOpenChange">
    <CollapsibleTrigger>Toggle</CollapsibleTrigger>
    <CollapsiblePanel>Content</CollapsiblePanel>
  </CollapsibleRoot>
</template>
```

## API reference

### Root

Groups all parts of the collapsible. Renders a `<div>` element.

| Prop           | Type                                           | Default     | Description                                                                                             |
| -------------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`           | `string \| Component`                          | `'div'`     | The element or component to use for the root node.                                                      |
| `open`         | `boolean`                                      | `undefined` | Whether the collapsible panel is currently open (controlled).                                           |
| `default-open` | `boolean`                                      | `false`     | Whether the collapsible panel is initially open (uncontrolled).                                         |
| `disabled`     | `boolean`                                      | `false`     | Whether the component should ignore user interaction.                                                   |
| `class`        | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state.    |
| `style`        | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Emits         |  Type                                         | Description                                      |
| ------------- | --------------------------------------------- | ------------------------------------------------ |
| `open-change` | `(open: boolean, details: EventDetails)`      | Emitted when the panel is opened or closed.      |

### Trigger

A button that opens and closes the collapsible panel. Renders a `<button>` element.

| Prop            | Type                                           | Default     | Description                                                                                             |
| --------------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`            | `string \| Component`                          | `'button'`  | The element or component to use for the root node.                                                      |
| `disabled`      | `boolean`                                      | `undefined` | Whether the trigger should ignore user interaction. When undefined, inherits from CollapsibleRoot.       |
| `native-button` | `boolean`                                      | `true`      | Whether the component renders a native `<button>` element.                                              |
| `class`         | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state.    |
| `style`         | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute         | Description                                   |
| ----------------- | --------------------------------------------- |
| `data-panel-open` | Present when the collapsible panel is open.   |

### Panel

A panel with the collapsible contents. Renders a `<div>` element.

| Prop               | Type                                           | Default     | Description                                                                                                                           |
| ------------------ | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `as`               | `string \| Component`                          | `'div'`     | The element or component to use for the root node.                                                                                    |
| `id`               | `string`                                       | `undefined` | The `id` attribute of the panel element. When set, overrides the auto-generated panel id.                                             |
| `keep-mounted`     | `boolean`                                      | `false`     | Whether to keep the element in the DOM while the panel is hidden.                                                                     |
| `hidden-until-found` | `boolean`                                    | `false`     | Allows the browser's built-in page search to find and expand the panel contents. Overrides `keep-mounted` and uses `hidden="until-found"`. |
| `class`            | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state.                                  |
| `style`            | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state.                               |

| Attribute             | Description                              |
| --------------------- | ---------------------------------------- |
| `data-open`           | Present when the collapsible panel is open.   |
| `data-closed`         | Present when the collapsible panel is closed. |
| `data-starting-style` | Present when the panel is animating in.  |
| `data-ending-style`   | Present when the panel is animating out. |

| CSS Variable                 | Description                        |
| ---------------------------- | ---------------------------------- |
| `--collapsible-panel-height` | The collapsible panel's height.    |
| `--collapsible-panel-width`  | The collapsible panel's width.     |
