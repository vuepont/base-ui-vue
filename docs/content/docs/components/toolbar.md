---
title: Toolbar
description: A high-quality, unstyled Vue toolbar component for grouping buttons and controls.
---

# Toolbar

A container for grouping a set of buttons and controls.

## Usage guidelines

- **Use inputs sparingly**: In horizontal toolbars, arrow keys are used both for roving focus and for moving the text cursor inside inputs. Keep inputs to a minimum and place them near the end of the toolbar.

## Anatomy

Import the components and assemble their parts:

```vue title="Anatomy"
<script setup>
import {
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarRoot,
  ToolbarSeparator,
} from 'base-ui-vue'
</script>

<template>
  <ToolbarRoot>
    <ToolbarButton />
    <ToolbarLink href="#" />
    <ToolbarSeparator />
    <ToolbarGroup>
      <ToolbarButton />
      <ToolbarButton />
    </ToolbarGroup>
    <ToolbarInput />
  </ToolbarRoot>
</template>
```

<!-- ## Examples

### Vertical orientation

Use the `orientation` prop to switch the toolbar to vertical keyboard navigation.
-->

<!--
TODO: Restore the parity examples below once the Vue package has the required
companion components and render-prop integrations.

### Using with Menu

All Base UI popup components that provide a `Trigger` component can be integrated
with a toolbar by passing the trigger to `<ToolbarButton>` with the `as`/renderless
composition API.

### Using with Tooltip

Unlike other popups, the toolbar item should be passed to the trigger component
so the tooltip owns the trigger semantics.

### Using with NumberField

To use a NumberField in the toolbar, pass the Vue NumberField input primitive to
`<ToolbarInput>` once the NumberField component exists in this package.
-->

## API reference

### Root

A container for grouping a set of controls, such as buttons, toggle groups, or menus. Renders a `<div>` element.

| Prop          | Type                                           | Default        | Description                                                                                         |
| ------------- | ---------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| `as`          | `string \| Component`                          | `'div'`        | The element or component to use for the root node.                                                  |
| `disabled`    | `boolean`                                      | `false`        | Whether the component is disabled.                                                                  |
| `orientation` | `'horizontal' \| 'vertical'`                   | `'horizontal'` | The orientation of the toolbar.                                                                     |
| `loop-focus`  | `boolean`                                      | `true`         | If `true`, using keyboard navigation will wrap focus to the other end of the toolbar once the end is reached. |
| `class`       | `string \| ((state: State) => string)`         | `undefined`    | CSS class applied to the element, or a function that returns a class based on the component state.  |
| `style`       | `StyleValue \| ((state: State) => StyleValue)` | `undefined`    | Style applied to the element, or a function that returns a style object based on the component state. |

| Attribute         | Description                               |
| ----------------- | ----------------------------------------- |
| `data-disabled`   | Present when the toolbar is disabled.     |
| `data-orientation`| Indicates the toolbar orientation.        |

### Button

A button that can be used as-is or as a trigger for other components. Renders a `<button>` element.

| Prop                      | Type                                           | Default     | Description                                                                                             |
| ------------------------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`                      | `string \| Component`                          | `'button'`  | The element or component to use for the root node.                                                      |
| `disabled`                | `boolean`                                      | `false`     | Whether the component is disabled.                                                                       |
| `focusable-when-disabled` | `boolean`                                      | `true`      | Whether the component remains focusable when disabled.                                                   |
| `native-button`           | `boolean`                                      | `true`      | Whether the component is being rendered as a native button.                                              |
| `class`                   | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component state.     |
| `style`                   | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component state.  |

| Attribute          | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| `data-disabled`    | Present when the button is disabled.                       |
| `data-focusable`   | Present when the button remains focusable while disabled.  |
| `data-orientation` | Indicates the toolbar orientation.                         |

### Link

A link component. Renders an `<a>` element.

| Prop    | Type                                           | Default     | Description                                                                                             |
| ------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`    | `string \| Component`                          | `'a'`       | The element or component to use for the root node.                                                      |
| `class` | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component state.     |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component state.  |

| Attribute          | Description                        |
| ------------------ | ---------------------------------- |
| `data-orientation` | Indicates the toolbar orientation. |

### Input

A native input element that integrates with Toolbar keyboard navigation. Renders an `<input>` element.

| Prop                      | Type                                           | Default     | Description                                                                                             |
| ------------------------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`                      | `string \| Component`                          | `'input'`   | The element or component to use for the root node.                                                      |
| `disabled`                | `boolean`                                      | `false`     | Whether the component is disabled.                                                                       |
| `focusable-when-disabled` | `boolean`                                      | `true`      | Whether the component remains focusable when disabled.                                                   |
| `default-value`           | `string \| number`                             | `undefined` | The initial input value.                                                                                |
| `class`                   | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component state.     |
| `style`                   | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component state.  |

| Attribute          | Description                                               |
| ------------------ | --------------------------------------------------------- |
| `data-disabled`    | Present when the input is disabled.                       |
| `data-focusable`   | Present when the input remains focusable while disabled.  |
| `data-orientation` | Indicates the toolbar orientation.                        |

### Group

Groups several toolbar items or toggles. Renders a `<div>` element.

| Prop       | Type                                           | Default     | Description                                                                                             |
| ---------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`       | `string \| Component`                          | `'div'`     | The element or component to use for the root node.                                                      |
| `disabled` | `boolean`                                      | `false`     | Whether all toolbar items in the group are disabled.                                                    |
| `class`    | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component state.     |
| `style`    | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component state.  |

| Attribute          | Description                            |
| ------------------ | -------------------------------------- |
| `data-disabled`    | Present when the group is disabled.    |
| `data-orientation` | Indicates the toolbar orientation.     |

### Separator

A separator element accessible to screen readers. Renders a `<div>` element.

| Prop          | Type                                           | Default     | Description                                                                                             |
| ------------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`          | `string \| Component`                          | `'div'`     | The element or component to use for the root node.                                                      |
| `orientation` | `'horizontal' \| 'vertical'`                   | `undefined` | The orientation of the separator. Defaults to the opposite of the toolbar orientation when not provided. |
| `class`       | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component state.     |
| `style`       | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component state.  |

| Attribute          | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| `data-orientation` | Indicates the orientation of the separator.                        |
