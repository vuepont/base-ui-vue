# Accordion

A set of collapsible panels with headings.

<ComponentPreview name="Accordion" />

## Anatomy

Import the component and assemble its parts:

```vue title="Anatomy"
<script setup>
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionRoot,
  AccordionTrigger,
} from 'base-ui-vue'
</script>

<template>
  <AccordionRoot>
    <AccordionItem>
      <AccordionHeader>
        <AccordionTrigger />
      </AccordionHeader>
      <AccordionPanel />
    </AccordionItem>
  </AccordionRoot>
</template>
```

## Examples

### Open multiple panels

You can set up the accordion to allow multiple panels to be open at the same time using the `multiple` prop.

<ComponentPreview name="AccordionMultiple" />

### Controlled state

Use the `value` prop and `value-change` event for controlled behavior:

```vue
<script setup>
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionRoot,
  AccordionTrigger,
} from 'base-ui-vue'
import { ref } from 'vue'

const openValues = ref([])

function handleValueChange(value, details) {
  openValues.value = value
}
</script>

<template>
  <AccordionRoot :value="openValues" @value-change="handleValueChange">
    <AccordionItem value="item-1">
      <AccordionHeader>
        <AccordionTrigger>Item 1</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>Content 1</AccordionPanel>
    </AccordionItem>
    <AccordionItem value="item-2">
      <AccordionHeader>
        <AccordionTrigger>Item 2</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>Content 2</AccordionPanel>
    </AccordionItem>
  </AccordionRoot>
</template>
```

## Animations

The Accordion panel can be animated using CSS transitions or CSS animations via the `--accordion-panel-height` and `--accordion-panel-width` CSS variables combined with `data-starting-style` and `data-ending-style` data attributes.

```css
.Panel {
  height: var(--accordion-panel-height);
  overflow: hidden;
  transition: height 150ms ease-out;
}

.Panel[data-starting-style],
.Panel[data-ending-style] {
  height: 0;
}
```

## API reference

### Root

Groups all parts of the accordion. Renders a `<div>` element.

| Prop               | Type                                           | Default      | Description                                                                                                                                          |
| ------------------ | ---------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`               | `string \| Component`                          | `'div'`      | The element or component to use for the root node.                                                                                                   |
| `value`            | `any[]`                                        | `undefined`  | The controlled value of the item(s) that should be expanded.                                                                                         |
| `default-value`    | `any[]`                                        | `[]`         | The uncontrolled value of the item(s) that should be initially expanded.                                                                             |
| `disabled`         | `boolean`                                      | `false`      | Whether the component should ignore user interaction.                                                                                                |
| `hidden-until-found` | `boolean`                                    | `false`      | Allows the browser's built-in page search to find and expand the panel contents. Overrides `keep-mounted` and uses `hidden="until-found"`.           |
| `keep-mounted`     | `boolean`                                      | `false`      | Whether to keep the element in the DOM while the panel is closed. Ignored when `hidden-until-found` is used.                                         |
| `loop-focus`       | `boolean`                                      | `true`       | Whether to loop keyboard focus back to the first item when the end of the list is reached while using the arrow keys.                                |
| `multiple`         | `boolean`                                      | `false`      | Whether multiple items can be open at the same time.                                                                                                 |
| `orientation`      | `'horizontal' \| 'vertical'`                   | `'vertical'` | The visual orientation of the accordion. Controls whether roving focus uses left/right or up/down arrow keys.                                        |
| `class`            | `string \| ((state: State) => string)`         | `undefined`  | CSS class applied to the element, or a function that returns a class based on the component's state.                                                 |
| `style`            | `StyleValue \| ((state: State) => StyleValue)` | `undefined`  | Style applied to the element, or a function that returns a style object based on the component's state.                                              |

| Emits          | Type                                            | Description                                                       |
| -------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| `value-change` | `(value: any[], details: EventDetails)`         | Emitted when an accordion item is expanded or collapsed.          |

| Attribute          | Description                                    |
| ------------------ | ---------------------------------------------- |
| `data-disabled`    | Present when the accordion is disabled.        |
| `data-orientation` | Indicates the orientation of the accordion.    |

### Item

Groups an accordion header with the corresponding panel. Renders a `<div>` element.

| Prop       | Type                                           | Default     | Description                                                                                             |
| ---------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`       | `string \| Component`                          | `'div'`     | The element or component to use for the root node.                                                      |
| `value`    | `any`                                          | `undefined` | A unique value that identifies this accordion item. If not provided, a unique ID will be generated.     |
| `disabled` | `boolean`                                      | `false`     | Whether the component should ignore user interaction.                                                   |
| `class`    | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state.    |
| `style`    | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Emits         | Type                                          | Description                                      |
| ------------- | --------------------------------------------- | ------------------------------------------------ |
| `open-change` | `(open: boolean, details: EventDetails)`      | Emitted when the panel is opened or closed.      |

| Attribute       | Description                                    |
| --------------- | ---------------------------------------------- |
| `data-index`    | Indicates the index of the accordion item.     |
| `data-disabled` | Present when the accordion item is disabled.   |
| `data-open`     | Present when the accordion item is open.       |
| `data-closed`   | Present when the accordion item is closed.     |

### Header

A heading that labels the corresponding panel. Renders an `<h3>` element.

| Prop    | Type                                           | Default     | Description                                                                                             |
| ------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`    | `string \| Component`                          | `'h3'`     | The element or component to use for the root node.                                                       |
| `class` | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state.    |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute       | Description                                    |
| --------------- | ---------------------------------------------- |
| `data-index`    | Indicates the index of the accordion item.     |
| `data-disabled` | Present when the accordion item is disabled.   |
| `data-open`     | Present when the accordion item is open.       |
| `data-closed`   | Present when the accordion item is closed.     |

### Trigger

A button that opens and closes the corresponding panel. Renders a `<button>` element.

| Prop            | Type                                           | Default     | Description                                                                                             |
| --------------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`            | `string \| Component`                          | `'button'`  | The element or component to use for the root node.                                                      |
| `disabled`      | `boolean`                                      | `undefined` | Whether the trigger should ignore user interaction. When undefined, inherits from the item/root.        |
| `id`            | `string`                                       | `undefined` | The id of the trigger element. When set, overrides the auto-generated trigger id.                       |
| `native-button` | `boolean`                                      | `true`      | Whether the component renders a native `<button>` element.                                              |
| `class`         | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state.    |
| `style`         | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state. |

| Attribute         | Description                                   |
| ----------------- | --------------------------------------------- |
| `data-panel-open` | Present when the accordion panel is open.     |

### Panel

A collapsible panel with the accordion item contents. Renders a `<div>` element.

| Prop                 | Type                                           | Default     | Description                                                                                                                                           |
| -------------------- | ---------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`                 | `string \| Component`                          | `'div'`     | The element or component to use for the root node.                                                                                                    |
| `id`                 | `string`                                       | `undefined` | The id of the panel element. When set, overrides the auto-generated panel id.                                                                         |
| `keep-mounted`       | `boolean`                                      | `undefined` | Whether to keep the element in the DOM while the panel is hidden. When undefined, inherits from the root.                                             |
| `hidden-until-found` | `boolean`                                      | `undefined` | Allows the browser's built-in page search to find and expand the panel contents. Overrides `keep-mounted` and uses `hidden="until-found"`.            |
| `class`              | `string \| ((state: State) => string)`         | `undefined` | CSS class applied to the element, or a function that returns a class based on the component's state.                                                  |
| `style`              | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component's state.                                               |

| Attribute             | Description                                    |
| --------------------- | ---------------------------------------------- |
| `data-open`           | Present when the accordion panel is open.      |
| `data-closed`         | Present when the accordion panel is closed.    |
| `data-starting-style` | Present when the panel is animating in.        |
| `data-ending-style`   | Present when the panel is animating out.       |
| `data-index`          | Indicates the index of the accordion item.     |

| CSS Variable              | Description                     |
| ------------------------- | ------------------------------- |
| `--accordion-panel-height` | The accordion panel's height.  |
| `--accordion-panel-width`  | The accordion panel's width.   |
