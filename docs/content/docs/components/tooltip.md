---
title: Tooltip
description: A high-quality, unstyled Vue tooltip component that appears when an element is hovered or focused.
---

# Tooltip

A popup that appears when an element is hovered or focused, showing a hint for sighted users.

<ComponentPreview name="Tooltip" />

## Usage guidelines

- **Prefer using tooltips as visual labels only**: Tooltips should provide supplementary clarity. Do not hide essential information in a tooltip.
- **Provide an accessible name for the trigger**: Tooltips are visual-only hints and are not a replacement for labels. Icon-only triggers should have an `aria-label` that closely matches the tooltip content.
- **Use Popover for interactive content**: If the popup needs links, buttons, forms, or touch-friendly access, use a Popover-style component instead of Tooltip.

## Anatomy

Import the component parts and assemble them:

```vue title="Anatomy"
<script setup lang="ts">
import {
  TooltipArrow,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipViewport,
} from 'base-ui-vue'
</script>

<template>
  <TooltipProvider>
    <TooltipRoot>
      <TooltipTrigger />
      <TooltipPortal>
        <TooltipPositioner>
          <TooltipPopup>
            <TooltipArrow />
            <TooltipViewport />
          </TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
```

## Examples

### Detached trigger

Use `createTooltipHandle()` when the trigger and tooltip root are defined in different places.

```vue title="Detached trigger"
<script setup lang="ts">
import { createTooltipHandle, TooltipRoot, TooltipTrigger } from 'base-ui-vue'

const tooltip = createTooltipHandle()
</script>

<template>
  <TooltipTrigger :handle="tooltip">
    Delete
  </TooltipTrigger>
  <TooltipRoot :handle="tooltip">
    <!-- portal, positioner, and popup -->
  </TooltipRoot>
</template>
```

<ComponentPreview name="TooltipDetached" />

### Multiple triggers

One tooltip can be shared by multiple triggers. Pass `payload` to a trigger and read it from the root scoped slot.

```vue title="Payload scoped slot"
<TooltipTrigger :handle="tooltip" :payload="{ label: 'Archive' }">
  Archive
</TooltipTrigger>

<TooltipRoot :handle="tooltip" v-slot="{ payload }">
  <TooltipPopup>
    {{ payload?.label }}
  </TooltipPopup>
</TooltipRoot>
```

<ComponentPreview name="TooltipMultiple" />

### Controlled state

Use the `open` prop and `open-change` event to control visibility. When a tooltip has multiple triggers, use `trigger-id` on `TooltipRoot` and `id` on `TooltipTrigger`.

<ComponentPreview name="TooltipControlled" />

## API reference

### Provider

Provides shared delays for a group of tooltips.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `delay` | `number` | `600` | How long to wait before opening a tooltip, in milliseconds. |
| `close-delay` | `number` | `0` | How long to wait before closing a tooltip, in milliseconds. |
| `timeout` | `number` | `400` | Another tooltip opens instantly if the previous tooltip closed within this timeout. |

### Root

Groups all parts of a tooltip. Does not render an element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `undefined` | Whether the tooltip is currently open. |
| `default-open` | `boolean` | `false` | Whether the tooltip is initially open. |
| `disabled` | `boolean` | `false` | Whether the tooltip should ignore interaction. |
| `disable-hoverable-popup` | `boolean` | `false` | Whether hovering the popup should keep it open. |
| `track-cursor-axis` | `'none' \| 'x' \| 'y' \| 'both'` | `'none'` | Which cursor axis the tooltip should track. |
| `handle` | `TooltipHandle` | `undefined` | A handle that links detached triggers to the root. |
| `trigger-id` | `string \| null` | `undefined` | The active trigger id in controlled mode. |
| `default-trigger-id` | `string \| null` | `null` | The active trigger id for an initially open uncontrolled tooltip. |

| Emits | Type | Description |
| --- | --- | --- |
| `open-change` | `(open: boolean, details: EventDetails) => void` | Emitted when the tooltip requests to open or close. Call `details.cancel()` to prevent the internal change. |
| `open-change-complete` | `(open: boolean) => void` | Emitted after the popup's open or close animation completes. |

### Trigger

The element that opens the tooltip. Renders a `<button>` element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'button'` | The element or component to render. |
| `native-button` | `boolean` | `true` | Whether the rendered element is a native button. |
| `handle` | `TooltipHandle` | `undefined` | Associates this trigger with a detached tooltip root. |
| `payload` | `unknown` | `undefined` | Data exposed to the root scoped slot when this trigger opens the tooltip. |
| `delay` | `number` | `600` | How long to wait before opening on hover. |
| `close-on-click` | `boolean` | `true` | Whether clicking an open trigger closes the tooltip. |
| `close-delay` | `number` | `0` | How long to wait before closing after hover leaves. |
| `disabled` | `boolean` | `false` | Whether this trigger should ignore interaction. |
| `id` | `string` | auto-generated | The trigger id. |

| Attribute | Description |
| --- | --- |
| `data-popup-open` | Present when this trigger's tooltip is open. |
| `data-trigger-disabled` | Present when the trigger is disabled. |

### Portal

Teleports the tooltip contents. Uses Vue's native `Teleport`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `keep-mounted` | `boolean` | `false` | Whether to keep the portal contents mounted while hidden. |
| `to` | `string \| HTMLElement` | `'body'` | Teleport target. |
| `disabled` | `boolean` | `false` | Disables Teleport while preserving mount behavior. |

### Positioner

Positions the tooltip against the active trigger. Renders a `<div>` element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'div'` | The element or component to render. |
| `anchor` | `HTMLElement \| VirtualElement \| null` | active trigger | Custom anchor element. |
| `position-method` | `'absolute' \| 'fixed'` | `'absolute'` | CSS positioning strategy. |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Preferred side of the trigger. |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Preferred alignment on the side axis. |
| `side-offset` | `number` | `0` | Distance from the trigger on the side axis. |
| `align-offset` | `number` | `0` | Offset on the alignment axis. |
| `collision-padding` | `Padding` | `5` | Padding used when avoiding viewport collisions. |
| `arrow-padding` | `Padding` | `5` | Padding between the arrow and popup edge. |

| Attribute | Description |
| --- | --- |
| `data-open` / `data-closed` | Indicates tooltip open state. |
| `data-side` | The resolved side after collision handling. |
| `data-align` | The resolved alignment after collision handling. |
| `data-anchor-hidden` | Present when the anchor is hidden by clipping. |

| CSS Variable | Description |
| --- | --- |
| `--available-width` / `--available-height` | Available collision-aware space. |
| `--anchor-width` / `--anchor-height` | Active trigger dimensions. |
| `--positioner-width` / `--positioner-height` | Positioner dimensions. |
| `--transform-origin` | Suggested transform origin for popup animation. |

### Popup

The tooltip content container. Renders a `<div role="tooltip">` element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'div'` | The element or component to render. |
| `id` | `string` | auto-generated | The popup id used by the trigger while open. |

| Attribute | Description |
| --- | --- |
| `data-open` / `data-closed` | Indicates tooltip open state. |
| `data-side` | The resolved side. |
| `data-align` | The resolved alignment. |
| `data-starting-style` | Present while animating in. |
| `data-ending-style` | Present while animating out. |
| `data-instant` | Present when transitions should be skipped. |

### Arrow

Displays an arrow positioned against the active trigger. Renders a `<div>` element.

| Attribute | Description |
| --- | --- |
| `data-side` | The resolved side. |
| `data-align` | The resolved alignment. |
| `data-uncentered` | Present when the arrow could not be centered. |
| `data-instant` | Present when transitions should be skipped. |

### Viewport

Wraps payload-driven tooltip content in a `data-current` container for content transitions.

| Attribute | Description |
| --- | --- |
| `data-activation-direction` | Direction from the previous trigger to the current trigger. |
| `data-current` | Applied to the current content wrapper inside the viewport. |

## createTooltipHandle

Creates a handle that links detached triggers to a tooltip root.

```ts
const tooltip = createTooltipHandle<{ label: string }>()
```

| API | Type | Description |
| --- | --- | --- |
| `open(triggerId)` | `(triggerId: string) => void` | Opens the tooltip for the trigger with the given id. |
| `close()` | `() => void` | Closes the tooltip. |
| `isOpen` | `boolean` | Whether the tooltip is currently open. |
