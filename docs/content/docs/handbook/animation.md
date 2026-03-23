# Animation

A guide to animating Base UI Vue components.

Base UI Vue components can be animated using CSS transitions, CSS animations, or JavaScript animation. Each components provides a number of data attributes to target its states, as well as a few attributes specifically for animation.

## CSS transitions

Use the following Base UI Vue attributes for creating transitions when a component becomes visible or hidden:

- `[data-starting-style]` corresponds to the initial style to transition from.
- `[data-ending-style]` corresponds to the final style to transition to.

Transitions are generally preferable because they can be interrupted smoothly when the component changes state mid-animation.

```css{7-12} title="collapsible.css"
.Panel {
  height: var(--collapsible-panel-height);
  overflow: hidden;
  transition:
    height 150ms ease,
    opacity 150ms ease;

  &[data-starting-style],
  &[data-ending-style] {
    height: 0;
    opacity: 0;
  }
}
```

## CSS animations

Use the following Base UI Vue attributes for CSS keyframe animations:

- `data-open` corresponds to the style applied when a component becomes visible.
- `data-closed` corresponds to the style applied before a component becomes hidden.

```css title="collapsible.css"
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.Panel[data-open] {
  animation: fadeIn 200ms ease-out;
}

.Panel[data-closed] {
  animation: fadeOut 150ms ease-in;
}
```
