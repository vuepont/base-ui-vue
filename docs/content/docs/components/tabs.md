---
title: Tabs
description: A high-quality, unstyled Vue tabs component for toggling between related panels on the same page.
---

# Tabs

A component for toggling between related panels on the same page.

<ComponentPreview name="Tabs" />

## Anatomy

Import the component and assemble its parts:

```vue title="Anatomy"
<script setup lang="ts">
import {
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsRoot,
  TabsTab,
} from 'base-ui-vue'
</script>

<template>
  <TabsRoot>
    <TabsList>
      <TabsTab />
      <TabsIndicator />
    </TabsList>
    <TabsPanel />
  </TabsRoot>
</template>
```

## Examples

### Links

Set `as="a"` and `:native-button="false"` on `<TabsTab>` to render tabs as links.

```vue{8-10} title="Tabs as links"
<script setup lang="ts">
import { TabsList, TabsRoot, TabsTab } from 'base-ui-vue'
</script>

<template>
  <TabsRoot default-value="overview">
    <TabsList>
      <TabsTab as="a" href="/overview" :native-button="false" value="overview">
        Overview
      </TabsTab>
    </TabsList>
  </TabsRoot>
</template>
```

### Controlled state

Use the `value` prop and `value-change` event for controlled behavior.

```vue{9} title="Controlled tabs"
<script setup lang="ts">
import { ref } from 'vue'
import { TabsList, TabsPanel, TabsRoot, TabsTab } from 'base-ui-vue'

const value = ref('overview')
</script>

<template>
  <TabsRoot :value="value" @value-change="(nextValue) => value = nextValue">
    <TabsList>
      <TabsTab value="overview">Overview</TabsTab>
      <TabsTab value="projects">Projects</TabsTab>
    </TabsList>
    <TabsPanel value="overview">Overview panel</TabsPanel>
    <TabsPanel value="projects">Projects panel</TabsPanel>
  </TabsRoot>
</template>
```

## API reference

### Root

Groups the tabs and the corresponding panels.
Renders a `<div>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | The element or component to use for the root node. Pass `Slot` for renderless mode. |
| `default-value` | `any \| null` | `0` | The uncontrolled value of the tab that should be initially active. When `null`, no tab is active. |
| `value` | `any \| null` | `undefined` | The controlled value of the currently active tab. When `null`, no tab is active. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | The component orientation. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component state. |

| Emits | Type | Description |
| ----- | ---- | ----------- |
| `value-change` | `(value, details) => void` | Emitted when a new tab value is being set. `details.reason` is `'none'` for user changes, `'initial'` for the first automatic selection, `'disabled'` when an uncontrolled selected tab becomes disabled, or `'missing'` when an uncontrolled selected tab is removed or never mounts. User changes can be canceled with `details.cancel()`. |

| Attribute | Type | Description |
| --------- | ---- | ----------- |
| `data-orientation` | `'horizontal' \| 'vertical'` | Indicates the orientation of the tabs. |
| `data-activation-direction` | `'left' \| 'right' \| 'up' \| 'down' \| 'none'` | Indicates the direction of the activation based on the previous active tab. |

### List

Groups the individual tab buttons.
Renders a `<div>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | The element or component to use for the root node. Pass `Slot` for renderless mode. |
| `activate-on-focus` | `boolean` | `false` | Whether to automatically change the active tab on arrow key focus. Otherwise, tabs are activated with Enter, Space, or pointer press. |
| `loop-focus` | `boolean` | `true` | Whether keyboard focus loops back to the first tab when the end of the list is reached. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component state. |

| Attribute | Type | Description |
| --------- | ---- | ----------- |
| `data-orientation` | `'horizontal' \| 'vertical'` | Indicates the orientation of the tabs. |
| `data-activation-direction` | `'left' \| 'right' \| 'up' \| 'down' \| 'none'` | Indicates the direction of the activation based on the previous active tab. |

### Tab

An individual interactive tab button that toggles the corresponding panel.
Renders a `<button>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'button'` | The element or component to use for the root node. Pass `Slot` for renderless mode. |
| `value` | `any \| null` | Required | The value of the tab. |
| `disabled` | `boolean` | `false` | Whether the tab should ignore user interaction. Disabled tabs remain focusable for composite keyboard navigation. |
| `id` | `string` | `undefined` | The id of the tab element. |
| `native-button` | `boolean` | `true` | Whether the component renders a native `<button>` element. Set to `false` when using `as` with a non-button element. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component state. |

| Attribute | Type | Description |
| --------- | ---- | ----------- |
| `data-orientation` | `'horizontal' \| 'vertical'` | Indicates the orientation of the tabs. |
| `data-disabled` | - | Present when the tab is disabled. |
| `data-active` | - | Present when the tab is active. |
| `data-activation-direction` | `'left' \| 'right' \| 'up' \| 'down' \| 'none'` | Indicates the direction of the activation based on the previous active tab. |

### Indicator

A visual indicator that can be styled to match the position of the active tab.
Renders a `<span>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'span'` | The element or component to use for the root node. Pass `Slot` for renderless mode. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component state. |

| Attribute | Type | Description |
| --------- | ---- | ----------- |
| `data-orientation` | `'horizontal' \| 'vertical'` | Indicates the orientation of the tabs. |
| `data-activation-direction` | `'left' \| 'right' \| 'up' \| 'down' \| 'none'` | Indicates the direction of the activation based on the previous active tab. |

| CSS Variable | Description |
| ------------ | ----------- |
| `--active-tab-left` | The distance from the left side of the tab list to the active tab. |
| `--active-tab-right` | The distance from the right side of the tab list to the active tab. |
| `--active-tab-top` | The distance from the top side of the tab list to the active tab. |
| `--active-tab-bottom` | The distance from the bottom side of the tab list to the active tab. |
| `--active-tab-width` | The active tab width. |
| `--active-tab-height` | The active tab height. |

### Panel

A panel displayed when the corresponding tab is active.
Renders a `<div>` element.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `as` | `string \| Component` | `'div'` | The element or component to use for the root node. Pass `Slot` for renderless mode. |
| `value` | `any \| null` | Required | The value of the corresponding tab. |
| `keep-mounted` | `boolean` | `false` | Whether to keep the HTML element in the DOM while the panel is hidden. |
| `id` | `string` | `undefined` | The id of the tab panel element. |
| `class` | `any \| ((state: State) => any)` | `undefined` | CSS class applied to the element, or a function that returns a class based on the component state. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | `undefined` | Style applied to the element, or a function that returns a style object based on the component state. |

| Attribute | Type | Description |
| --------- | ---- | ----------- |
| `data-orientation` | `'horizontal' \| 'vertical'` | Indicates the orientation of the tabs. |
| `data-activation-direction` | `'left' \| 'right' \| 'up' \| 'down' \| 'none'` | Indicates the direction of the activation based on the previous active tab. |
| `data-hidden` | - | Present when the panel is hidden. |
| `data-index` | - | Indicates the index of the tab panel. |
| `data-starting-style` | - | Present when the panel is animating in. |
| `data-ending-style` | - | Present when the panel is animating out. |
