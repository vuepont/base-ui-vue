# Styling

A guide to styling Base UI Vue components with your preferred styling engine.

Base UI Vue components are unstyled, do not bundle CSS, and are compatible with Tailwind CSS, plain CSS, CSS Modules or any other styling solution you prefer in Vue. You retain total control of your styling layer.

## Style hooks

### CSS classes

Components that render an HTML element accept a `class` prop to style the element with CSS classes.

```vue title="button.vue"
<script setup lang="ts">
import { Button } from 'base-ui-vue'
</script>

<template>
  <Button class="Button">
    Save
  </Button>
</template>
```

The prop can also be passed a function that takes the component's state as an argument.

```vue title="button.vue"
<script setup lang="ts">
import { Button } from 'base-ui-vue'
</script>

<template>
  <Button :class="(state) => state.disabled ? 'Button Button--disabled' : 'Button'">
    Save
  </Button>
</template>
```

### Data attributes

Components provide data attributes designed for styling their states. For example, [Collapsible](/docs/components/collapsible) can be styled using attributes such as `data-open`, `data-closed`, `data-starting-style`, and `data-ending-style`.

```css title="collapsible.css"
.Panel[data-open] {
  border-color: var(--color-blue-500);
}

.Panel[data-closed] {
  opacity: 0.8;
}
```

### CSS variables

Components expose CSS variables to aid in styling. For example, [Collapsible](/docs/components/collapsible) exposes `--collapsible-panel-height` and `--collapsible-panel-width` on the panel.

```css title="collapsible.css"
.Panel {
  height: var(--collapsible-panel-height);
  overflow: hidden;
}
```

Check out each component's API reference for the available data attributes and CSS variables.

### Style prop

Components that render an HTML element accept a `style` prop to style the element with a style object.

```vue title="button.vue"
<script setup lang="ts">
import { Button } from 'base-ui-vue'
</script>

<template>
  <Button :style="{ minWidth: '10rem' }">
    Save
  </Button>
</template>
```

The prop also accepts a function that takes the component's state as an argument.

```vue title="button.vue"
<script setup lang="ts">
import { Button } from 'base-ui-vue'
</script>

<template>
  <Button :style="(state) => ({ opacity: state.disabled ? 0.5 : 1 })">
    Save
  </Button>
</template>
```

## Tailwind CSS

Apply Tailwind CSS classes to each part via the `class` prop.

```vue title="collapsible.vue"
<script setup lang="ts">
import {
  CollapsiblePanel,
  CollapsibleRoot,
  CollapsibleTrigger,
} from 'base-ui-vue'
</script>

<template>
  <CollapsibleRoot class="w-72 rounded-md border border-gray-200 bg-white text-gray-900">
    <CollapsibleTrigger
      class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-gray-50"
    >
      Details
    </CollapsibleTrigger>

    <CollapsiblePanel
      class="overflow-hidden px-4 pb-4 text-sm text-gray-700 transition-[height,opacity] data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
    >
      Base UI Vue leaves the styling up to you.
    </CollapsiblePanel>
  </CollapsibleRoot>
</template>
```

## CSS Modules

Apply CSS Module classes to each part via the `class` prop, then style those classes in a CSS Modules block or file.

```vue title="collapsible.vue"
<script setup lang="ts">
import {
  CollapsiblePanel,
  CollapsibleRoot,
  CollapsibleTrigger,
} from 'base-ui-vue'
import { useCssModule } from 'vue'

const styles = useCssModule()
</script>

<template>
  <CollapsibleRoot :class="styles.Root">
    <CollapsibleTrigger :class="styles.Trigger">
      Details
    </CollapsibleTrigger>
    <CollapsiblePanel :class="styles.Panel">
      Base UI Vue leaves the styling up to you.
    </CollapsiblePanel>
  </CollapsibleRoot>
</template>

<style module>
.Root {
  width: 18rem;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.5rem;
  background: white;
}

.Trigger {
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
}

.Panel {
  padding: 0 1rem 1rem;
}
</style>
```

## CSS-in-JS

The same part-by-part styling approach also works with Vue-compatible CSS-in-JS libraries. The important part is the pattern: style or wrap each Base UI Vue part, then assemble those styled parts together.

In practice, the styling hooks stay the same:

- `class`
- `style`
- state-driven `data-*` attributes
- documented CSS variables

That means the same component can move between plain CSS, Tailwind CSS, CSS Modules, and CSS-in-JS without changing its behavior contract.
