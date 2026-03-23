# DirectionProvider

Enables RTL behavior for Base UI Vue components.

<ComponentPreview name="DirectionProviderHero" />

## Anatomy

Import the component and wrap it around your app:

```vue title="Anatomy"
<script setup lang="ts">
import { DirectionProvider } from 'base-ui-vue'
</script>

<template>
  <DirectionProvider direction="rtl">
    <!-- Your app or a group of components -->
  </DirectionProvider>
</template>
```

`<DirectionProvider>` lets child Base UI Vue components read the current text direction, but it does not apply document or layout direction on its own. Set `dir="rtl"` on the relevant HTML subtree, or apply `direction: rtl` in your own styles when you also need the DOM and CSS to follow RTL.

## API reference

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `direction` | `TextDirection` | `'ltr'` | The reading direction of the text. |

## useDirection

Use this composable to read the current text direction. This is useful when you need direction-aware behavior in your own components, including portaled content that is rendered outside an element with `dir` applied.

`useDirection()` returns a `ComputedRef<TextDirection>`. In templates it is automatically unwrapped; in script code, read `direction.value`.

### Return value

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `direction` | `ComputedRef<'ltr' \| 'rtl'>` | `'ltr'` | The current text direction. |

```vue title="Reading direction"
<script setup lang="ts">
import { useDirection } from 'base-ui-vue'
import { computed } from 'vue'

const direction = useDirection()
const label = computed(() =>
  direction.value === 'rtl' ? 'Right to left' : 'Left to right',
)
</script>

<template>
  <p>{{ label }}</p>
</template>
```
