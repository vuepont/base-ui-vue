# Avatar

An easily stylable avatar component.

<ComponentPreview name="Avatar" />

## Anatomy

Import the component and assemble its parts:

```vue title="Anatomy"
<script setup>
import { AvatarFallback, AvatarImage, AvatarRoot } from 'base-ui-vue'
</script>

<template>
  <AvatarRoot>
    <AvatarImage src="" />
    <AvatarFallback>LT</AvatarFallback>
  </AvatarRoot>
</template>
```

## API reference

### AvatarRoot Props

| Name    | Type                                           | Default     | Description                                                                                             |
| ------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`    | `string \| Component`                          | `'span'`    | The element or component to use for the root node.                                                      |
| `class` | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state.    |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

### AvatarImage Props

| Name             | Type                                           | Default     | Description                                                                                             |
| ---------------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`             | `string \| Component`                          | `'img'`     | The element or component to use for the root node.                                                      |
| `src`            | `string`                                       | `undefined` | The image source.                                                                                       |
| `referrerPolicy` | `string`                                       | `undefined` | The referrer policy for the image.                                                                      |
| `crossOrigin`    | `string`                                       | `undefined` | The cross origin attribute for the image.                                                               |
| `class`          | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state.    |
| `style`          | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

**Emits:**

- `@loadingStatusChange(status: 'idle' | 'loading' | 'loaded' | 'error')`: Callback fired when the loading status changes.

### AvatarImage Data attributes

| Attribute             | Description                              |
| --------------------- | ---------------------------------------- |
| `data-starting-style` | Present when the image is animating in.  |
| `data-ending-style`   | Present when the image is animating out. |

### AvatarFallback Props

| Name    | Type                                           | Default     | Description                                                                                             |
| ------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`    | `string \| Component`                          | `'span'`    | The element or component to use for the root node.                                                      |
| `delay` | `number`                                       | `undefined` | How long to wait before showing the fallback. Specified in milliseconds.                                |
| `class` | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state.    |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |
