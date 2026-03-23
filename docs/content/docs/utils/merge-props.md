---
title: mergeProps
description: A utility to merge multiple sets of props, handling event handlers, class, and style props intelligently.
---

# mergeProps

Utilities for merging Vue props and attributes with Base UI Vue semantics.

`mergeProps` helps you combine multiple prop objects into a single object you can bind with `v-bind`. This is useful when you need to layer internal props, fallthrough attrs, and user-defined listeners without losing Base UI Vue behavior.

It behaves like normal Vue prop merging for most keys, with a few special cases so common Base UI Vue patterns work as expected.

## How merging works

- For most keys (everything except `class`, `style`, and event listeners), the value from the rightmost object wins:

  ```ts
  mergeProps({ id: 'a', dir: 'ltr' }, { id: 'b' })
  // returns { id: 'b', dir: 'ltr' }
  ```

- `class` values are concatenated right-to-left (rightmost first):

  ```ts
  mergeProps({ class: 'a' }, { class: 'b' })
  // class is 'b a'
  ```

- `style` values are merged using Vue's native style merging, with keys from the rightmost style overwriting earlier ones.

- Event listeners are merged and executed right-to-left (rightmost first):
  ```ts
  mergeProps({ onClick: a }, { onClick: b })
  // b runs before a
  ```

- When a merged listener receives an event object, Base UI Vue adds `event.preventBaseUIHandler()`. Calling it prevents earlier merged listeners from running.
    This does not call `preventDefault()` or `stopPropagation()`.

- The merged listener returns the rightmost handler's return value.

- Additional listener arguments are preserved, so Vue component emits like `(value, event)` continue to work.

- If no event object is present in the listener arguments, `preventBaseUIHandler()` is not available and all handlers execute.

### Preventing Base UI Vue's default behavior

You can use `mergeProps` to combine a component's internal props with consumer props, and call `preventBaseUIHandler()` to stop the internal behavior from running.

<ComponentPreview name="MergePropsPrevent" />

## API reference

### mergeProps

This function accepts Vue prop objects.
If you need to merge dynamically assembled prop layers, including optional `undefined` entries, use `mergePropsN` instead.

### mergePropsN

This function accepts an array of Vue prop objects.
It uses the same semantics as `mergeProps` and ignores `undefined` entries, so it works well when prop layers are built dynamically.
