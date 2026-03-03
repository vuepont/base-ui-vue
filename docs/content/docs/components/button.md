# Button

A button component that can be rendered as another tag or focusable when disabled.

<ComponentPreview name="Button" />

## Usage guidelines

- **Submit buttons**: Unlike the native button element, `type="submit"` must be specified on Button for it to act as a submit button.
- **Links**: The Button component enforces button semantics (`role="button"`, keyboard interaction, disabled state). It should not be used for links. See [Rendering links as buttons](#rendering-links-as-buttons) below.

## Anatomy

Import the component:

```vue title="Anatomy"
<script setup>
import { Button } from 'base-ui-vue'
</script>

<template>
  <Button />
</template>
```

## Examples

### Rendering as another tag

The button can remain keyboard accessible while being rendered as another tag, such as a `<div>`, by specifying `as="div"`.

<ComponentPreview name="ButtonAs" />

### Rendering links as buttons

The Button component enforces button semantics. `:native-button="false"` signals that the rendered tag is not a `<button>`, but it must still be a tag that can receive button semantics (`role="button"`, keyboard interaction handlers). Links (`<a>`) have their own semantics and should not be rendered as buttons through the `as` prop.

If a link needs to look like a button visually, style the `<a>` element directly with CSS rather than using the Button component.

### Loading states

For buttons that enter a loading state after being clicked, specify the `focusable-when-disabled` prop to ensure focus remains on the button when it becomes disabled. This prevents focus from being lost and maintains the tab order.

<ComponentPreview name="ButtonLoading" />

### Disabled state

<ComponentPreview name="ButtonDisabled" />

### Focusable when disabled

<ComponentPreview name="ButtonFocusableDisabled" />

## API Reference

### Props

| Name                      | Type                                           | Default     | Description                                                                                             |
| ------------------------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`                      | `string \| Component`                          | `'button'`  | The element or component to use for the root node.                                                      |
| `disabled`                | `boolean`                                      | `false`     | Whether the button should ignore user interaction.                                                      |
| `focusable-when-disabled` | `boolean`                                      | `false`     | Whether the button should be focusable when disabled.                                                   |
| `native-button`           | `boolean`                                      | `undefined` | Whether the component renders a native `<button>` element. If `undefined`, it is inferred from `as`.    |
| `class`                   | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state.    |
| `style`                   | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

### Data attributes

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-disabled` | Present when the button is disabled. |
