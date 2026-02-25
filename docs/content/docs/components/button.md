# Button

A button component that can be rendered as another tag or focusable when disabled.

## Preview

<div class="preview-container flex gap-4 p-4 border border-gray-200 rounded-lg">
  <BaseUIButton class="demo-button" @click="() => window.alert('Base UI Button Clicked!')">
    Base UI Button
  </BaseUIButton>

  <BaseUIButton disabled class="demo-button demo-disabled">
    Disabled Button
  </BaseUIButton>

  <BaseUIButton as="div" class="demo-button demo-div" @click="() => window.alert('Div acting as Button Clicked!')">
    Div as Button
  </BaseUIButton>
</div>

## Usage

```vue
<script setup>
import { Button } from 'base-ui-vue'

function handleClick() {
  window.alert('Clicked!')
}
</script>

<template>
  <BaseUIButton @click="handleClick">
    Click me
  </BaseUIButton>
</template>
```

## Examples

### Rendering as another tag

The button can remain keyboard accessible while being rendered as another tag, such as a `<div>`, by specifying `as="div"`.

```vue
<template>
  <BaseUIButton as="div" @click="() => window.alert('div clicked')">
    I am a div but act as a button
  </BaseUIButton>
</template>
```

### Disabled state

```vue
<template>
  <BaseUIButton disabled @click="() => window.alert('This should not show')">
    Disabled Button
  </BaseUIButton>
</template>
```

### Loading / Focusable when disabled

For buttons that enter a loading state after being clicked, specify the `focusable-when-disabled` prop to ensure focus remains on the button when it becomes disabled.

```vue
<template>
  <BaseUIButton disabled focusable-when-disabled>
    Loading...
  </BaseUIButton>
</template>
```

## API

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'button'` | The element or component to use for the root node. |
| `disabled` | `boolean` | `false` | Whether the button should ignore user interaction. |
| `focusable-when-disabled` | `boolean` | `false` | Whether the button should be focusable when disabled. |
| `native-button` | `boolean` | `undefined` | Whether the component renders a native `<button>` element. If undefined, it is inferred from `as`. |

<style>
.preview-container {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.demo-button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.demo-button:hover {
  background-color: #2563eb;
}

.demo-button:active {
  background-color: #1d4ed8;
}

.demo-button.demo-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.demo-button.demo-div {
  background-color: #10b981;
}

.demo-button.demo-div:hover {
  background-color: #059669;
}
</style>
