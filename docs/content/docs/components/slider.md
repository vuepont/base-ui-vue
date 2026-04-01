---
title: Slider
description: A high-quality, unstyled Vue slider component that works like a range input and is easy to style.
---

# Slider

An easily stylable range input.

<ComponentPreview name="Slider" />

## Usage guidelines

- **Form controls must have an accessible name**: Prefer `<SliderLabel>`, or provide an `aria-label` on each `<SliderThumb>` when no visible label is rendered. See [Labeling a slider](#labeling-a-slider) and the [forms guide](/docs/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```vue title="Anatomy"
<script setup lang="ts">
import {
  SliderControl,
  SliderIndicator,
  SliderLabel,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from 'base-ui-vue'
</script>

<template>
  <SliderRoot>
    <SliderLabel />
    <SliderValue />
    <SliderControl>
      <SliderTrack>
        <SliderIndicator />
        <SliderThumb />
      </SliderTrack>
    </SliderControl>
  </SliderRoot>
</template>
```

## Examples

### Range slider

To create a range slider:

1. Pass an array of values and place a `<SliderThumb>` for each value in the array.
2. Additionally, for server-rendered range sliders, specify a numeric `index` on each thumb that corresponds to the index of its value in the value array.

Thumbs can be configured to behave differently when they collide during pointer interactions using the `thumb-collision-behavior` prop on `<SliderRoot>`.

<ComponentPreview name="SliderRange" />

### Thumb alignment

Set `thumb-alignment="edge"` to inset the thumb so its edge aligns with the control edge when the value is at `min` or `max`, without overflowing the control like the default `"center"` alignment.

<ComponentPreview name="SliderEdgeAlignment" />

### Labeling a slider

A single-thumb slider without a visible label can be labeled using `aria-label` on `<SliderThumb>`:

```vue{5} title="Slider with invisible label"
<SliderRoot>
  <SliderControl>
    <SliderTrack>
      <SliderIndicator />
      <SliderThumb aria-label="Volume" />
    </SliderTrack>
  </SliderControl>
</SliderRoot>
```

A visible label can be created using `<SliderLabel>`:

```vue{2} title="Slider with visible label"
<SliderRoot>
  <SliderLabel>Volume</SliderLabel>
  <SliderControl>
    <SliderTrack>
      <SliderIndicator />
      <SliderThumb />
    </SliderTrack>
  </SliderControl>
</SliderRoot>
```

For a multi-thumb range slider with a visible label, add `aria-label` on each `<SliderThumb>` to distinguish them:

```vue{6-7} title="Labeling multi-thumb range sliders"
<SliderRoot :default-value="[25, 75]">
  <SliderLabel>Price range</SliderLabel>
  <SliderControl>
    <SliderTrack>
      <SliderIndicator />
      <SliderThumb :index="0" aria-label="Minimum price" />
      <SliderThumb :index="1" aria-label="Maximum price" />
    </SliderTrack>
  </SliderControl>
</SliderRoot>
```

### Vertical

Set `orientation="vertical"` on `<SliderRoot>` to build a vertical slider.

<ComponentPreview name="SliderVertical" />

### Form integration

To use a slider in a form, pass the slider `name` to `<SliderRoot>`:

```vue{15} title="Using Slider in a form"
<script setup lang="ts">
import {
  Form,
  SliderControl,
  SliderIndicator,
  SliderLabel,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from 'base-ui-vue'
</script>

<template>
  <Form>
    <SliderRoot name="volume">
      <SliderLabel>Volume</SliderLabel>
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb />
        </SliderTrack>
      </SliderControl>
    </SliderRoot>
  </Form>
</template>
```

For grouped multi-thumb range sliders in forms, [Fieldset](/docs/components/fieldset) can provide the shared visible label while each thumb keeps its own `aria-label`:

```vue{13-14,18-19} title="Using Fieldset with a multi-thumb slider"
<script setup lang="ts">
import { FieldsetLegend, FieldsetRoot } from 'base-ui-vue'
import {
  SliderControl,
  SliderIndicator,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from 'base-ui-vue'
</script>

<template>
  <FieldsetRoot :as="SliderRoot" name="price">
    <FieldsetLegend>Price range</FieldsetLegend>
    <SliderControl>
      <SliderTrack>
        <SliderIndicator />
        <SliderThumb aria-label="Minimum price" />
        <SliderThumb aria-label="Maximum price" />
      </SliderTrack>
    </SliderControl>
  </FieldsetRoot>
</template>
```

## API reference

### Root

Groups all parts of the slider.
Renders a `<div>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `name` | `string` | `undefined` | Identifies the field when a form is submitted. |
| `default-value` | `number \| number[]` | `undefined` | The uncontrolled value of the slider when it's initially rendered. To render a controlled slider, use the `value` prop instead. |
| `value` | `number \| number[]` | `undefined` | The value of the slider. For ranged sliders, provide an array with two values. |
| `form` | `string` | `undefined` | Identifies the form that owns the slider inputs. Useful when the slider is rendered outside the form. |
| `locale` | `Intl.LocalesArgument` | `undefined` | The locale used by `Intl.NumberFormat` when formatting the value. Defaults to the user's runtime locale. |
| `thumb-alignment` | `'center' \| 'edge' \| 'edge-client-only'` | `'center'` | How the thumb(s) are aligned relative to `SliderControl` when the value is at `min` or `max`: `center`: The center of the thumb is aligned with the control edge. `edge`: The thumb is inset within the control such that its edge is aligned with the control edge. `edge-client-only`: Same as `edge` but renders after hydration on the client, reducing bundle size in return. |
| `thumb-collision-behavior` | `'push' \| 'swap' \| 'none'` | `'push'` | Controls how thumbs behave when they collide during pointer interactions. `'push'` (default): Thumbs push each other without restoring their previous positions when dragged back. `'swap'`: Thumbs swap places when dragged past each other. `'none'`: Thumbs cannot move past each other; excess movement is ignored. |
| `step` | `number` | `1` | The granularity with which the slider can step through values. (A discrete slider.) The `min` prop serves as the origin for the valid values. We recommend `(max - min)` to be evenly divisible by the step. |
| `large-step` | `number` | `10` | The granularity with which the slider can step through values when using Page Up/Page Down or Shift + Arrow Up/Arrow Down. |
| `min-steps-between-values` | `number` | `0` | The minimum steps between values in a range slider. |
| `min` | `number` | `0` | The minimum allowed value of the slider. Should not be equal to `max`. |
| `max` | `number` | `100` | The maximum allowed value of the slider. Should not be equal to `min`. |
| `format` | `Intl.NumberFormatOptions` | `undefined` | Options to format the input value. |
| `disabled` | `boolean` | `false` | Whether the slider should ignore user interaction. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | The component orientation. |
| `as` | `string \| Component` | `'div'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Emits | Type | Description |
| ----- | ---- | ----------- |
| `value-change` | `(value, details) => void` | Callback function that is fired when the slider's value changed. You can pull out the new value by accessing `details.event.target.value` (any). The `details.reason` indicates what triggered the change: `'input-change'` when the hidden range input emits a change event (for example, via form integration), `'track-press'` when the control track is pressed, `'drag'` while dragging a thumb, `'keyboard'` for keyboard input, `'none'` when the change is triggered without a specific interaction. |
| `value-committed` | `(value, details) => void` | Callback function that is fired when the interaction is committed. `details.reason` indicates what triggered the commit: `'drag'` while dragging a thumb, `'track-press'` when the control track is pressed, `'keyboard'` for keyboard input, `'input-change'` when the hidden range input emits a change event, or `'none'` when the commit occurs without a specific interaction. |

| Attribute | Type | Description |
| --------- | ---- | ----------- |
| `data-dragging` | - | Present while the user is dragging. |
| `data-orientation` | `'horizontal' \| 'vertical'` | Indicates the orientation of the slider. |
| `data-disabled` | - | Present when the slider is disabled. |
| `data-valid` | - | Present when the slider is in valid state (when wrapped in `FieldRoot`). |
| `data-invalid` | - | Present when the slider is in invalid state (when wrapped in `FieldRoot`). |
| `data-dirty` | - | Present when the slider's value has changed (when wrapped in `FieldRoot`). |
| `data-touched` | - | Present when the slider has been touched (when wrapped in `FieldRoot`). |
| `data-focused` | - | Present when the slider is focused (when wrapped in `FieldRoot`). |

### Label

An accessible label that is automatically associated with the slider thumbs.
Renders a `<div>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute | Description |
| --------- | ----------- |
| `data-dragging` | Present while the user is dragging. |
| `data-disabled` | Present when the slider is disabled. |
| `data-orientation` | Indicates the slider orientation. |
| `data-valid` | Present when the slider is in valid state (when wrapped in `FieldRoot`). |
| `data-invalid` | Present when the slider is in invalid state (when wrapped in `FieldRoot`). |
| `data-dirty` | Present when the slider's value has changed (when wrapped in `FieldRoot`). |
| `data-touched` | Present when the slider has been touched (when wrapped in `FieldRoot`). |
| `data-focused` | Present when the slider is focused (when wrapped in `FieldRoot`). |

### Value

Displays the current value of the slider as text.
Renders an `<output>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'output'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `aria-live` | `'off' \| 'polite' \| 'assertive'` | `'off'` | Controls how value updates are announced to assistive technology. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Slot prop | Type | Description |
| --------- | ---- | ----------- |
| `formatted-values` | `string[]` | The formatted values for each thumb. |
| `values` | `number[]` | The raw numeric values for each thumb. |

| Attribute | Description |
| --------- | ----------- |
| `data-dragging` | Present while the user is dragging. |
| `data-disabled` | Present when the slider is disabled. |
| `data-orientation` | Indicates the slider orientation. |
| `data-valid` | Present when the slider is in valid state (when wrapped in `FieldRoot`). |
| `data-invalid` | Present when the slider is in invalid state (when wrapped in `FieldRoot`). |
| `data-dirty` | Present when the slider's value has changed (when wrapped in `FieldRoot`). |
| `data-touched` | Present when the slider has been touched (when wrapped in `FieldRoot`). |
| `data-focused` | Present when the slider is focused (when wrapped in `FieldRoot`). |

### Control

The clickable, interactive part of the slider.
Renders a `<div>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute | Description |
| --------- | ----------- |
| `data-dragging` | Present while the user is dragging. |
| `data-disabled` | Present when the slider is disabled. |
| `data-orientation` | Indicates the slider orientation. |
| `data-valid` | Present when the slider is in valid state (when wrapped in `FieldRoot`). |
| `data-invalid` | Present when the slider is in invalid state (when wrapped in `FieldRoot`). |
| `data-dirty` | Present when the slider's value has changed (when wrapped in `FieldRoot`). |
| `data-touched` | Present when the slider has been touched (when wrapped in `FieldRoot`). |
| `data-focused` | Present when the slider is focused (when wrapped in `FieldRoot`). |

### Track

Contains the slider indicator and thumbs.
Renders a `<div>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute | Description |
| --------- | ----------- |
| `data-dragging` | Present while the user is dragging. |
| `data-disabled` | Present when the slider is disabled. |
| `data-orientation` | Indicates the slider orientation. |
| `data-valid` | Present when the slider is in valid state (when wrapped in `FieldRoot`). |
| `data-invalid` | Present when the slider is in invalid state (when wrapped in `FieldRoot`). |
| `data-dirty` | Present when the slider's value has changed (when wrapped in `FieldRoot`). |
| `data-touched` | Present when the slider has been touched (when wrapped in `FieldRoot`). |
| `data-focused` | Present when the slider is focused (when wrapped in `FieldRoot`). |

### Indicator

Visualizes the current value of the slider.
Renders a `<div>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute | Description |
| --------- | ----------- |
| `data-dragging` | Present while the user is dragging. |
| `data-disabled` | Present when the slider is disabled. |
| `data-orientation` | Indicates the slider orientation. |
| `data-valid` | Present when the slider is in valid state (when wrapped in `FieldRoot`). |
| `data-invalid` | Present when the slider is in invalid state (when wrapped in `FieldRoot`). |
| `data-dirty` | Present when the slider's value has changed (when wrapped in `FieldRoot`). |
| `data-touched` | Present when the slider has been touched (when wrapped in `FieldRoot`). |
| `data-focused` | Present when the slider is focused (when wrapped in `FieldRoot`). |

### Thumb

The draggable part of the slider at the tip of the indicator.
Renders a `<div>` element and a nested `<input type="range">`.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `disabled` | `boolean` | `false` | Whether the thumb should ignore user interaction. |
| `get-aria-label` | `(index: number) => string` | `undefined` | A function which returns a string value for the [`aria-label`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label) attribute of the input. |
| `get-aria-value-text` | `(formattedValue: string, value: number, index: number) => string` | `undefined` | A function which returns a string value for the [`aria-valuetext`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuetext) attribute of the input. This is important for screen reader users. |
| `index` | `number` | `undefined` | The index of the thumb which corresponds to the index of its value in the `value` or `default-value` array. This prop is required to support server-side rendering for range sliders with multiple thumbs. |
| `input-ref` | `Ref<HTMLInputElement \| null> \| ((el: HTMLInputElement \| null) => void)` | `undefined` | A ref to access the nested input element. |
| `tab-index` | `number` | `undefined` | Optional tab index attribute forwarded to the input. |
| `aria-label` | `string` | `undefined` | Accessible label forwarded to the nested input. |
| `aria-labelledby` | `string` | `undefined` | Accessible label relationship forwarded to the nested input. |
| `aria-describedby` | `string` | `undefined` | Accessible description relationship forwarded to the nested input. |
| `as` | `string \| Component` | `'div'` | Allows you to replace the component's HTML element with a different tag or component. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state. |
| `style` | `CSSProperties \| ((state: State) => CSSProperties)` | `undefined` | Style applied to the thumb, or a function that returns a style object based on the component's state. |

`SliderThumb` also forwards native focus listeners to the nested `<input type="range">`. In Vue templates, use `@focus` and `@blur`. If you're working with render functions or forwarded attr objects, these correspond to `onFocus` and `onBlur`.

| Listener | Type | Description |
| -------- | ---- | ----------- |
| `@focus` | `(event: FocusEvent) => void` | Focus handler forwarded to the nested input element. |
| `@blur` | `(event: FocusEvent) => void` | Blur handler forwarded to the nested input element. |

| Attribute | Description |
| --------- | ----------- |
| `data-dragging` | Present while the user is dragging. |
| `data-orientation` | Indicates the orientation of the slider. |
| `data-disabled` | Present when the thumb is disabled. |
| `data-valid` | Present when the slider is in valid state (when wrapped in `FieldRoot`). |
| `data-invalid` | Present when the slider is in invalid state (when wrapped in `FieldRoot`). |
| `data-dirty` | Present when the slider's value has changed (when wrapped in `FieldRoot`). |
| `data-touched` | Present when the slider has been touched (when wrapped in `FieldRoot`). |
| `data-focused` | Present when the slider is focused (when wrapped in `FieldRoot`). |
| `data-index` | Indicates the index of the thumb in range sliders. |
