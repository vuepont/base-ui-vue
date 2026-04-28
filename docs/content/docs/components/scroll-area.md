---
title: Scroll Area
description: A high-quality, unstyled Vue scroll area component with custom scrollbar styling.
---

# Scroll Area

A custom scrollable container with overlay scrollbars that can be styled to match your design.

<ComponentPreview name="ScrollArea" />

## Introduction

`ScrollArea` replaces the browser's native scrollbar with a custom one while preserving native scrolling behavior. It supports both vertical and horizontal scrolling, thumb dragging, track click-to-jump, and RTL layouts.

## Anatomy

Import the components and assemble them:

```vue title="Anatomy"
<script setup>
import {
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from 'base-ui-vue'
</script>

<template>
  <ScrollAreaRoot>
    <ScrollAreaViewport>
      <ScrollAreaContent>
        <!-- scrollable content -->
      </ScrollAreaContent>
    </ScrollAreaViewport>
    <ScrollAreaScrollbar>
      <ScrollAreaThumb />
    </ScrollAreaScrollbar>
    <ScrollAreaScrollbar orientation="horizontal">
      <ScrollAreaThumb />
    </ScrollAreaScrollbar>
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
```

## Both axes

Use two `ScrollAreaScrollbar` components (one vertical, one horizontal) with a `ScrollAreaCorner` for content that overflows in both directions:

<ComponentPreview name="ScrollAreaBoth" />

## Scroll fade

Use the `--scroll-area-overflow-y-start` and `--scroll-area-overflow-y-end` CSS variables on the Viewport to create a fade-out effect at the edges:

<ComponentPreview name="ScrollAreaScrollFade" />

## Keep scrollbar mounted

By default, scrollbars are unmounted when there is no overflow. Use `keep-mounted` to keep them in the DOM:

```vue
<ScrollAreaScrollbar keep-mounted>
  <ScrollAreaThumb />
</ScrollAreaScrollbar>
```

## CSS variables

The component exposes CSS custom properties for advanced styling:

| Variable | Applied to | Description |
| --- | --- | --- |
| `--scroll-area-corner-width` | Root | Width of the corner element in pixels. |
| `--scroll-area-corner-height` | Root | Height of the corner element in pixels. |
| `--scroll-area-thumb-width` | Scrollbar (horizontal) | Width of the thumb in pixels. |
| `--scroll-area-thumb-height` | Scrollbar (vertical) | Height of the thumb in pixels. |
| `--scroll-area-overflow-x-start` | Viewport | Distance from the horizontal start edge in pixels. |
| `--scroll-area-overflow-x-end` | Viewport | Distance from the horizontal end edge in pixels. |
| `--scroll-area-overflow-y-start` | Viewport | Distance from the vertical start edge in pixels. |
| `--scroll-area-overflow-y-end` | Viewport | Distance from the vertical end edge in pixels. |

## API reference

### Root

Groups all parts of the scroll area. Renders a `<div>` element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'div'` | The element or component to render. |
| `overflowEdgeThreshold` | `number \| { xStart, xEnd, yStart, yEnd }` | `0` | Pixel threshold before overflow edge data attributes are applied. |
| `class` | `string \| ((state: State) => string)` | -- | CSS class applied to the element. |
| `style` | `StyleValue \| ((state: State) => StyleValue)` | -- | Style applied to the element. |

| Data attribute | | Description |
| --- | --- | --- |
| `data-scrolling` | | Present when the user is scrolling. |
| `data-has-overflow-x` | | Present when horizontal overflow exists. |
| `data-has-overflow-y` | | Present when vertical overflow exists. |
| `data-overflow-x-start` | | Present when there is overflow at the horizontal start. |
| `data-overflow-x-end` | | Present when there is overflow at the horizontal end. |
| `data-overflow-y-start` | | Present when there is overflow at the vertical start. |
| `data-overflow-y-end` | | Present when there is overflow at the vertical end. |

### Viewport

The scrollable container. Renders a `<div>` element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'div'` | The element or component to render. |

### Content

An optional wrapper for the scrollable content. Renders a `<div>` element. Uses a `ResizeObserver` to recalculate the thumb position when content size changes.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'div'` | The element or component to render. |

### Scrollbar

A vertical or horizontal scrollbar track. Renders a `<div>` element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'div'` | The element or component to render. |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Which axis the scrollbar controls. |
| `keepMounted` | `boolean` | `false` | Whether to keep the scrollbar in the DOM when there is no overflow. |

| Data attribute | | Description |
| --- | --- | --- |
| `data-orientation` | `'vertical' \| 'horizontal'` | The scrollbar orientation. |
| `data-hovering` | | Present when the pointer is over the scroll area. |
| `data-scrolling` | | Present when the user is scrolling on this axis. |
| `data-has-overflow-x` | | Present when horizontal overflow exists. |
| `data-has-overflow-y` | | Present when vertical overflow exists. |
| `data-overflow-x-start` | | Present when there is overflow at the horizontal start. |
| `data-overflow-x-end` | | Present when there is overflow at the horizontal end. |
| `data-overflow-y-start` | | Present when there is overflow at the vertical start. |
| `data-overflow-y-end` | | Present when there is overflow at the vertical end. |

### Thumb

The draggable thumb inside a scrollbar. Renders a `<div>` element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'div'` | The element or component to render. |

| Data attribute | | Description |
| --- | --- | --- |
| `data-orientation` | `'vertical' \| 'horizontal'` | The thumb orientation (inherited from parent scrollbar). |

### Corner

The area at the intersection of horizontal and vertical scrollbars. Renders a `<div>` element. Only visible when both scrollbars are present.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `'div'` | The element or component to render. |
