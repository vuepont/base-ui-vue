---
title: CSPProvider
description: A CSP provider component that configures CSP-related behavior for inline tags rendered by Base UI Vue components.
---

# CSPProvider

Configures CSP-related behavior for inline tags rendered by Base UI Vue components.

## Anatomy

Import the component and wrap it around your app:

```vue title="Anatomy"
<script setup lang="ts">
import { CSPProvider } from 'base-ui-vue'
</script>

<template>
  <CSPProvider nonce="...">
    <!-- Your app or a group of components -->
  </CSPProvider>
</template>
```

Some Base UI Vue components render inline `<style>` or `<script>` tags for functionality such as removing scrollbars or pre-hydration behavior. Under a strict Content Security Policy (CSP), these tags may be blocked unless they include a matching [nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce) attribute.

`CSPProvider` lets you configure this behavior globally for all Base UI Vue components within its tree.

## Supplying a nonce

If you enforce a CSP that blocks inline tags by default, configure your server to:

1. Generate a random nonce per request
2. Include it in your CSP header (via `style-src-elem` / `script-src`)
3. Pass the same nonce into `CSPProvider` during rendering

```ts title="Example"
const nonce = crypto.randomUUID()

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'nonce-${nonce}'`,
  `style-src-elem 'self' 'nonce-${nonce}'`,
].join('; ')
```

Then:

```vue title="Providing the nonce"
<script setup lang="ts">
import { CSPProvider } from 'base-ui-vue'

defineProps<{
  nonce: string
}>()
</script>

<template>
  <CSPProvider :nonce="nonce">
    <!-- ... -->
  </CSPProvider>
</template>
```

This ensures that inline `<style>` and `<script>` tags rendered by Base UI Vue components include the correct nonce attribute, allowing them to function under your CSP.

## Disable inline style elements

You can avoid supplying a `nonce` if you disable inline `<style>` elements entirely and rely on external stylesheets only. The relevant Vue component today is `<SliderThumb>` when edge alignment pre-hydration behavior is enabled, as well as any future Base UI Vue components that inject inline styles for runtime behavior.

Specify `disable-style-elements` to prevent Base UI Vue from rendering inline `<style>` tags:

```vue title="Disabling style elements"
<template>
  <CSPProvider disable-style-elements>
    <!-- ... -->
  </CSPProvider>
</template>
```

Inline `<script>` tags are opt-in, so they are not affected by this prop and do not have their own disable flag. A `nonce` is still required if any component in the tree uses inline scripts.

## Inline style attributes

`CSPProvider` covers inline `<style>` and `<script>` tags rendered as elements, but it does not cover inline style attributes such as `<div style="...">`. The `style-src-attr` directive in CSP governs inline style attributes encountered when parsing HTML from server pre-rendered components. It does not affect client-side JavaScript that sets styles at runtime.

In CSP, `style-src` applies to both `<style>` elements and `style=""` attributes. If you only want to control `<style>` elements, use `style-src-elem` instead.

If your CSP also blocks inline style attributes, you have a few options:

1. Relax your CSP by adding `'unsafe-inline'` to `style-src-attr`, or by using `style-src-elem` instead of `style-src` when that policy shape is acceptable.
2. Render the affected components only on the client, so inline styles are not present in the initial HTML.
3. Override inline styles in your own code where possible and move the styling into CSS. If you do this, you should still verify upgrades for any new inline styles introduced by Base UI Vue components.

## API reference

Provides a default Content Security Policy (CSP) configuration for Base UI Vue components that require inline `<style>` or `<script>` tags.

| Prop                     | Type      | Default     | Description |
| ------------------------ | --------- | ----------- | ----------- |
| `nonce`                  | `string`  | `undefined` | The nonce value to apply to inline `<style>` and `<script>` tags. |
| `disable-style-elements` | `boolean` | `false`     | Whether inline `<style>` elements created by Base UI Vue components should not be rendered. |
