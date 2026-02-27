# Button

A button component that can be rendered as another tag or focusable when disabled.

## Preview

  <BaseUIButton class="demo-button" id="my-btn">
    Base UI Button
  </BaseUIButton>

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

<BaseUIButton as="div" :native-button="false" class="demo-button">
Div as Button
</BaseUIButton>

```vue title="Custom tag button" "as"
<script setup>
import { Button } from 'base-ui-vue'
</script>

<template>
  <Button as="div" :native-button="false">
    Div as Button
  </Button>
</template>
```

### Rendering links as buttons

The Button component enforces button semantics. `:native-button="false"` signals that the rendered tag is not a `<button>`, but it must still be a tag that can receive button semantics (`role="button"`, keyboard interaction handlers). Links (`<a>`) have their own semantics and should not be rendered as buttons through the `as` prop.

If a link needs to look like a button visually, style the `<a>` element directly with CSS rather than using the Button component.

### Loading states

For buttons that enter a loading state after being clicked, specify the `focusable-when-disabled` prop to ensure focus remains on the button when it becomes disabled. This prevents focus from being lost and maintains the tab order.

<div>
<BaseUIButton
class="demo-button"
:disabled="loading"
focusable-when-disabled
@click="submit"
>
    {{ loading ? 'Submitting...' : 'Submit' }}
</BaseUIButton>
</div>

<script setup>
import { ref } from 'vue';

const loading = ref(false);
function submit() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 4000);
}
</script>

```vue title="Loading button" "focusable-when-disabled"
<script setup>
import { Button } from 'base-ui-vue'
import { ref } from 'vue'

const loading = ref(false)

function submit() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 4000)
}
</script>

<template>
  <Button :disabled="loading" focusable-when-disabled @click="submit">
    {{ loading ? "Submitting..." : "Submit" }}
  </Button>
</template>
```

### Disabled state

  <BaseUIButton disabled class="demo-button">
  Disabled Button
</BaseUIButton>

```vue title="Disabled button" "disabled"
<script setup>
import { Button } from 'base-ui-vue'
</script>

<template>
  <Button disabled>
    Disabled Button
  </Button>
</template>
```

### Focusable when disabled

<BaseUIButton focusable-when-disabled disabled class="demo-button">
Focusable disabled Button
</BaseUIButton>

```vue title="Focusable disabled button" "focusable-when-disabled"
<script setup>
import { Button } from 'base-ui-vue'
</script>

<template>
  <Button focusable-when-disabled disabled>
    Focusable disabled Button
  </Button>
</template>
```

## API reference

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

<style>
:root {
  --color-blue: oklch(45% 50% 264deg);
  --color-gray-50: oklch(98% 0.25% 264deg);
  --color-gray-100: oklch(12% 9.5% 264deg / 5%);
  --color-gray-200: oklch(12% 9% 264deg / 7%);
  --color-gray-300: oklch(12% 8.5% 264deg / 17%);
  --color-gray-500: oklch(12% 7.5% 264deg / 50%);
  --color-gray-900: oklch(12% 5% 264deg / 90%);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-blue: oklch(69% 50% 264deg);
    --color-gray-50: oklch(17% 0.25% 264deg);
    --color-gray-100: oklch(28% 0.75% 264deg / 65%);
    --color-gray-200: oklch(29% 0.75% 264deg / 80%);
    --color-gray-300: oklch(35% 0.75% 264deg / 80%);
    --color-gray-500: oklch(64% 1% 264deg / 80%);
    --color-gray-900: oklch(95% 0.5% 264deg / 90%);
  }
}

.demo-button {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  padding: 0 0.875rem;
  margin: 0;
  outline: 0;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.375rem;
  background-color: var(--color-gray-50);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5rem;
  color: var(--color-gray-900);
  user-select: none;
  cursor: pointer;
}

@media (hover: hover) {
  .demo-button:hover:not([data-disabled]) {
    background-color: var(--color-gray-100);
  }
}

.demo-button:active:not([data-disabled]) {
  background-color: var(--color-gray-200);
  box-shadow: inset 0 1px 3px var(--color-gray-200);
  border-top-color: var(--color-gray-300);
}

.demo-button:focus-visible {
  outline: 2px solid var(--color-blue);
  outline-offset: -1px;
}

.demo-button[data-disabled] {
  color: var(--color-gray-500);
  cursor: default;
}
</style>
