# TypeScript

A guide to using TypeScript with Base UI Vue.

Most Base UI Vue components can be used directly without any special TypeScript helpers. The utility types in this package are mainly useful when you are building your own wrapper components around Base UI Vue behavior.

## Utility types

The most important authoring helpers today are available from [useRender](/docs/utils/use-render):

- `useRender.ComponentProps<State, ExtraProps>`
- `useRender.ElementProps<Tag>`

## Typing wrapper component props

Use `useRender.ComponentProps` when you are defining the props for your own wrapper component and want to preserve Base UI Vue's `as`, `class`, and `style` behavior.

```ts title="button-props.ts"
import { useRender } from 'base-ui-vue'

interface ButtonState {
  disabled: boolean
}

type ButtonProps = useRender.ComponentProps<ButtonState, {
  tone?: 'primary' | 'neutral'
}>
```

## Typing forwarded element props

Use `useRender.ElementProps` for the props object you plan to pass to the rendered element.

```ts title="button-element-props.ts"
import { useRender } from 'base-ui-vue'

const defaultProps: useRender.ElementProps<'button'> = {
  type: 'button',
  class: 'Button',
}
```

## State-aware class and style callbacks

Functional `class` and `style` props receive a typed state object. This is useful when you build wrappers around components that expose state such as `disabled`, `open`, or transition state.

## Direction types

[DirectionProvider](/docs/utils/direction-provider) also exposes an important return type:

- `useDirection()` returns `ComputedRef<TextDirection>`

In templates this is automatically unwrapped. In script code, read `direction.value`.

## Keep the types close to the pattern

The easiest way to keep TypeScript friction low in Base UI Vue is to follow the package's existing composition patterns.

For concrete examples, start with:

- [useRender](/docs/utils/use-render)
- [mergeProps](/docs/utils/merge-props)
- [DirectionProvider](/docs/utils/direction-provider)
