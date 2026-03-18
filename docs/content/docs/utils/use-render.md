# useRender

Composable for enabling renderless mode in custom components.

The `useRender` composable lets you build custom components that can change their rendered tag using an `as` prop, and provides a renderless mode to let consumers completely override the default rendered element.

## Examples

The `as` prop for a custom component (like `CustomText`) lets consumers use it to replace the default rendered `p` element with a different tag or component.

<ComponentPreview name="UseRenderBasic" />

The renderless version (by passing the `Slot` sentinel) enables more control of how props are spread, and also passes the internal `state` of a component.

<ComponentPreview name="UseRenderRenderless" />

## Merging props

The `mergeProps` utility merges two or more sets of Vue props and attributes together. It safely merges three types of props:

1. Event handlers, so that all are invoked
2. `class` bindings (natively normalizing strings, arrays, and objects)
3. `style` bindings (natively normalizing strings, arrays, and objects)

`mergeProps` merges objects from left to right, so that subsequent objects' properties in the arguments overwrite previous ones. Merging props is useful when creating custom components, as well as inside the scoped slot payload of any Base UI component.

```vue title="Using mergeProps internally"
<script setup lang="ts">
import { mergeProps, useRender } from 'base-ui-vue'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ as?: any }>()

const { tag, renderProps } = useRender({
  defaultTagName: 'button',
  ...props,
  props: mergeProps(
    { class: 'Button', type: 'button' },
    { 'aria-label': 'Submit' },
  ),
})
</script>

<template>
  <component :is="tag" v-bind="renderProps">
    <slot />
  </component>
</template>
```

## Merging refs

When building custom components, you often need to control a ref internally while still letting external consumers pass their own.

In Vue, template refs and callback refs are natively bound via the `:ref` attribute. When passing `ref` to `useRender`, the composable automatically wraps it with an internal `useMergedRefs` utility so it resolves to the actual DOM element whether it's rendered normally or within a renderless slot.

```vue title="Merging Refs"
<script setup lang="ts">
import { useRender } from 'base-ui-vue'
import { computed, ref } from 'vue'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ as?: any }>()

const internalRef = ref<HTMLElement | null>(null)

const { tag, renderProps, renderless, state, ref: elementRef } = useRender({
  defaultTagName: 'p',
  ...props,
  props: computed(() => ({
    'aria-label': `Example ${internalRef.value ? 'ready' : 'idle'}`,
  })),
  ref: internalRef,
})
</script>

<template>
  <slot
    v-if="renderless"
    :ref="elementRef"
    :props="renderProps"
    :state="state"
  />
  <component
    :is="tag"
    v-else
    v-bind="renderProps"
    :ref="elementRef"
  >
    <slot />
  </component>
</template>
```

If a consumer uses the `Slot` renderless mode, they MUST bind the `ref` provided in the scoped slot to their own element for your internal ref to work.

```vue title="Binding exposed ref"
<template>
  <CustomText v-slot="{ props, ref }" :as="Slot">
    <!-- The ref provided here ensures CustomText's internalRef is populated -->
    <div v-bind="props" :ref="ref">
      Custom text
    </div>
  </CustomText>
</template>
```

## TypeScript

There are two helper types for authoring components around `useRender`:

- `useRender.ComponentProps<State, ExtraProps>` types the declared component props that belong in `defineProps()`.
- `useRender.ElementProps<Tag>` types the object you pass through `props`.

In Vue, regular DOM attributes and listeners are usually fallthrough attrs, so they still come from `useAttrs()` rather than `defineProps()`.

```vue title="Typing props"
<script setup lang="ts">
import { useRender } from 'base-ui-vue'
import { computed } from 'vue'

interface ButtonState {
  disabled: boolean
}

type ButtonProps = useRender.ComponentProps<ButtonState, {
  disabled?: boolean
}>

defineOptions({ inheritAttrs: false })

const props = defineProps<ButtonProps>()

const defaultProps: useRender.ElementProps<'button'> = {
  class: 'Button',
  type: 'button',
}

const state = computed<ButtonState>(() => ({
  disabled: props.disabled ?? false,
}))

const { tag, renderProps } = useRender({
  defaultTagName: 'button',
  ...props,
  state,
  props: defaultProps,
})
</script>
```

## Migrating from Reka UI

Reka UI uses an `asChild` prop, while Base UI Vue uses an `as` prop accepting the `Slot` sentinel.

In Reka UI, you pass `as-child` to remove the wrapper tag.

```vue title="Reka UI asChild prop"
<script setup>
import { Button } from 'reka-ui'
</script>

<template>
  <Button as-child>
    <a href="/login" class="primary">Login</a>
  </Button>
</template>
```

In Base UI Vue, `useRender` lets you achieve the same thing by passing `:as="Slot"`. The props and state are explicitly exposed through a scoped slot, which you then bind to your custom element using `v-bind`.

```vue title="Base UI Vue renderless mode"
<script setup>
import { Button, Slot } from 'base-ui-vue'
</script>

<template>
  <Button v-slot="{ props, ref }" :as="Slot">
    <a :ref="ref" href="/login" class="primary" v-bind="props">Login</a>
  </Button>
</template>
```

## API reference

### Input parameters (`UseRenderParams`)

| Parameter                | Type                                           | Description                                                                                                          |
| ------------------------ | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `defaultTagName`         | `string`                                       | The default tag name to use when `as` is not provided.                                                               |
| `as`                     | `string \| Component`                          | The element or component to use for the root node. Pass `Slot` for renderless mode.                                  |
| `props`                  | `MaybeRefOrGetter<Record<string, any> \| undefined>` | Props to be merged with the component's internal attributes. Use a getter or computed when they depend on reactive state. For stronger typing, use `useRender.ElementProps<'button'>` or another intrinsic tag. |
| `state`                  | `MaybeRefOrGetter<State \| undefined>`         | The state of the component. It automatically converts to `data-*` attributes and binds to `class`/`style` callbacks. |
| `stateAttributesMapping` | `StateAttributesMapping<State>`                | Custom mapping for converting state properties to `data-*` attributes.                                               |
| `class`                  | `any \| ((state: State) => any)`               | A Vue class binding or a function that receives the state and returns a class binding.                               |
| `style`                  | `StyleValue \| ((state: State) => StyleValue)` | A Vue style binding or a function that receives the state and returns a style binding.                               |
| `ref`                    | `RenderRef`                                    | The internal ref to apply to the rendered element.                                                                   |

### Return value (`UseRenderReturn`)

| Property      | Type                                            | Description                                                                  |
| ------------- | ----------------------------------------------- | ---------------------------------------------------------------------------- |
| `tag`         | `ComputedRef<string \| Component \| undefined>` | The resolved element or component to render. `undefined` in renderless mode. |
| `renderProps` | `ComputedRef<Record<string, any>>`              | All merged attributes to bind to the element using `v-bind`.                 |
| `renderless`  | `ComputedRef<boolean>`                          | `true` when `as` is `Slot`.                                                  |
| `state`       | `ComputedRef<Readonly<State>>`                  | The component state, passed through for slot exposure.                       |
| `ref`         | `((el: Element \| ComponentPublicInstance \| null) => void) \| undefined` | A callback ref to bind to the element using `:ref`. |

```vue title="Usage"
<script setup>
const { tag, renderProps, renderless, state, ref: elementRef } = useRender({
  // Input parameters
})
</script>

<template>
  <slot
    v-if="renderless"
    :ref="elementRef"
    :props="renderProps"
    :state="state"
  />
  <component
    :is="tag"
    v-else
    v-bind="renderProps"
    :ref="elementRef"
  >
    <!-- content -->
  </component>
</template>
```
