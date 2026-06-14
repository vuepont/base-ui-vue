---
title: Tooltip
description: A high-quality, unstyled Vue tooltip component that appears when an element is hovered or focused.
---

# Tooltip

A popup that appears when an element is hovered or focused, showing a hint for sighted users.

<ComponentPreview name="Tooltip" />

## Usage guidelines

- **Prefer using tooltips as visual labels only**: Tooltips should act as supplementary visual labels for sighted mouse and keyboard users. Tooltips alone are not accessible to touch or screen reader users. See [Alternatives to tooltips](#alternatives-to-tooltips) for more details.
- **Provide an accessible name for the trigger**: Tooltips are visual-only elements and are not a replacement for labeling the trigger. The tooltip's trigger must have an `aria-label` attribute that closely matches the tooltip's content to ensure consistency for screen reader users.

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

## Alternatives to tooltips

Tooltips should be supplementary popups that provide non-essential clarity in high-density UIs. A user should not miss critical information if they never see a tooltip.

Tooltips don't work well with touch input. Unlike mouse pointers with hover capability, there's no easily discoverable way to reveal a tooltip before tapping its trigger on a touch device.

iOS doesn't provide a system-standard, touch-friendly tooltip affordance, while Android may show a tooltip on long press. However, on the web, long press is often used to trigger contextual menus in the browser, which can lead to potential conflicts. For this reason, tooltips are disabled on touch devices.

### Infotips

Popups that open when hovering an info icon should use a Popover-style component that can also be opened by touch and assistive technology users.

To know when to reach for a popover-style component instead of a tooltip, consider the **purpose** of the trigger element: if the trigger's purpose is to open the popup itself, it's a popover. If the trigger's purpose is unrelated to opening the popup, it's a tooltip.

### Description text

Tooltips are designed for sighted users and are not a reliable way to deliver important information to touch users or assistive technologies. If the description is important to understanding the element, don't hide it behind a tooltip. Use inline text, or a Popover-style component if space is limited, so the information is accessible to everyone.

Since tooltips serve sighted mouse and keyboard users, iconography should clearly communicate the purpose of icon-only triggers, especially on mobile where the text label may not be visible.

If the description is not critical, a tooltip can still be used to provide extra clarity for sighted mouse or keyboard users.

### Contextual feedback messages

Use a toast-style component for contextual feedback messages so the message can be announced to screen readers and support more complex content.

## Examples

### Detached triggers

A tooltip can be controlled by a trigger located either inside or outside the `<TooltipRoot>` component.
For simple, one-off interactions, place the `<TooltipTrigger>` inside `<TooltipRoot>`, as shown in the example at the top of this page.

However, if defining the tooltip's content next to its trigger is not practical, you can use a detached trigger.
This involves placing the `<TooltipTrigger>` outside of `<TooltipRoot>` and linking them with a handle created by the `createTooltipHandle()` function.

```vue title="Detached triggers"
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

A single tooltip can be opened by multiple trigger elements.
You can achieve this by using the same `handle` for several detached triggers, or by placing multiple `<TooltipTrigger>` components inside a single `<TooltipRoot>`.

```vue title="Multiple triggers within the Root part"
<TooltipRoot>
  <TooltipTrigger>Trigger 1</TooltipTrigger>
  <TooltipTrigger>Trigger 2</TooltipTrigger>
  <!-- portal, positioner, and popup -->
</TooltipRoot>
```

```vue title="Multiple detached triggers"
<script setup lang="ts">
import { createTooltipHandle, TooltipRoot, TooltipTrigger } from 'base-ui-vue'

const tooltip = createTooltipHandle()
</script>

<template>
  <TooltipTrigger :handle="tooltip">
    Trigger 1
  </TooltipTrigger>

  <TooltipTrigger :handle="tooltip">
    Trigger 2
  </TooltipTrigger>

  <TooltipRoot :handle="tooltip">
    <!-- portal, positioner, and popup -->
  </TooltipRoot>
</template>
```

The tooltip can render different content depending on which trigger opened it.
This is achieved by passing a `payload` to the `<TooltipTrigger>` and reading it from the scoped slot exposed by `<TooltipRoot>`.

The payload can be strongly typed by providing a type argument to the `createTooltipHandle()` function:

```vue{11,15,19} title="Detached triggers with payload"
<script setup lang="ts">
import {
  createTooltipHandle,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
} from 'base-ui-vue'

const tooltip = createTooltipHandle<{ text: string }>()
</script>

<template>
  <TooltipTrigger :handle="tooltip" :payload="{ text: 'Trigger 1' }">
    Trigger 1
  </TooltipTrigger>

  <TooltipTrigger :handle="tooltip" :payload="{ text: 'Trigger 2' }">
    Trigger 2
  </TooltipTrigger>

  <TooltipRoot :handle="tooltip" v-slot="{ payload }">
    <TooltipPortal>
      <TooltipPositioner :side-offset="8">
        <TooltipPopup>
          <span v-if="payload">
            Tooltip opened by {{ payload.text }}
          </span>
        </TooltipPopup>
      </TooltipPositioner>
    </TooltipPortal>
  </TooltipRoot>
</template>
```

### Controlled mode with multiple triggers

You can control the tooltip's open state externally using the `open` prop and `open-change` event on `<TooltipRoot>`.
This allows you to manage the tooltip's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active with the `trigger-id` prop on `<TooltipRoot>` and the `id` prop on each `<TooltipTrigger>`.

Note that there is no separate `trigger-id-change` event.
Instead, the `open-change` event receives an additional `details` argument, which contains the trigger element that initiated the state change.

<ComponentPreview name="TooltipControlled" />

### Animating the Tooltip

You can animate a tooltip as it moves between different trigger elements.
This includes animating its position, size, and content.

#### Position and Size

To animate the tooltip's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

When content changes between triggers, you can use the Positioner's `--positioner-width` and `--positioner-height` CSS variables to keep the moving box stable while the popup resizes.

#### Content

The tooltip also supports content transitions.
This is useful when different triggers display different content within the same tooltip.

To enable content animations, wrap the content in the `<TooltipViewport>` part.
This part provides features to create direction-aware animations.
It renders a `div` with a `data-activation-direction` attribute containing space-separated horizontal and vertical directions, such as `right down` or `left up`, that indicate the new trigger's position relative to the previous one.

Inside the `<TooltipViewport>`, the content is further wrapped in `div`s with data attributes to help with styling:

- `data-current`: The currently visible content when no transitions are present or the incoming content.
- `data-previous`: The outgoing content during a transition.

You can use these attributes to style the enter and exit animations.

<ComponentPreview name="TooltipDetachedTriggersFull" />

## API reference

### Provider

Provides shared delays for a group of tooltips. The grouping logic ensures that once a tooltip becomes visible, the adjacent tooltips will be shown instantly.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `delay` | `number` | `600` | How long to wait before opening a tooltip, in milliseconds. |
| `close-delay` | `number` | `0` | How long to wait before closing a tooltip, in milliseconds. |
| `timeout` | `number` | `400` | Another tooltip opens instantly if the previous tooltip closed within this timeout. |

### Root

Groups all parts of a tooltip. Does not render an HTML element.

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

Wraps payload-driven tooltip content in current and previous containers for content transitions.

| Attribute | Description |
| --- | --- |
| `data-activation-direction` | Space-separated direction from the previous trigger to the current trigger. |
| `data-transitioning` | Present while previous and current content are both rendered for a transition. |
| `data-instant` | Present when transitions should be skipped. |
| `data-current` | Applied to the current content wrapper inside the viewport. |
| `data-previous` | Applied to the outgoing content wrapper during a transition. |

| CSS Variable | Description |
| --- | --- |
| `--popup-width` / `--popup-height` | Previous popup dimensions exposed on the `data-previous` wrapper. |

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
