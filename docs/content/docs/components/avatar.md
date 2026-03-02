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

### Root

Displays a user's profile picture, initials, or fallback icon. Renders a `<span>` element.

| Prop    | Default  | Type                                                                                                                                                          |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`    | `'span'` | `string \| Component`<br><br>The element or component to use for the root node.                                                                               |
| `class` | —        | `string \| ((state: State) => string)`<br><br>CSS class applied to the element, or a function that returns a class based on the component's state.            |
| `style` | —        | `StyleValue \| ((state: State) => StyleValue)`<br><br>Style applied to the element, or a function that returns a style object based on the component's state. |

### Image

The image to be displayed in the avatar. Renders an `<img>` element.

| Prop             | Default | Type                                                                                                                                                          |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`             | `'img'` | `string \| Component`<br><br>The element or component to use for the root node.                                                                               |
| `src`            | —       | `string`<br><br>The image source.                                                                                                                             |
| `referrerPolicy` | —       | `string`<br><br>The referrer policy for the image.                                                                                                            |
| `crossOrigin`    | —       | `string`<br><br>The cross origin attribute for the image.                                                                                                     |
| `class`          | —       | `string \| ((state: State) => string)`<br><br>CSS class applied to the element, or a function that returns a class based on the component's state.            |
| `style`          | —       | `StyleValue \| ((state: State) => StyleValue)`<br><br>Style applied to the element, or a function that returns a style object based on the component's state. |

| Emits                 | Type                                                  | Description                                     |
| --------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| `loadingStatusChange` | `((status: ImageLoadingStatus) => void) \| undefined` | Callback fired when the loading status changes. |

| Attribute             | Description                              |
| --------------------- | ---------------------------------------- |
| `data-starting-style` | Present when the image is animating in.  |
| `data-ending-style`   | Present when the image is animating out. |

### Fallback

Rendered when the image fails to load or when no image is provided. Renders a `<span>` element.

| Prop    | Default  | Type                                                                                                                                                          |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`    | `'span'` | `string \| Component`<br><br>The element or component to use for the root node.                                                                               |
| `delay` | —        | `number`<br><br>How long to wait before showing the fallback. Specified in milliseconds.                                                                      |
| `class` | —        | `string \| ((state: State) => string)`<br><br>CSS class applied to the element, or a function that returns a class based on the component's state.            |
| `style` | —        | `StyleValue \| ((state: State) => StyleValue)`<br><br>Style applied to the element, or a function that returns a style object based on the component's state. |
