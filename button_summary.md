# Button Component Port Summary (React to Vue)

This document summarizes the decisions, architecture, and implementation details for the `Button` component port.

## 1. Directory Structure
Following the React version's architecture while adapting for Vue conventions:
- `vue/packages/plugins/src/`: Shared utilities (React's root `utils` equivalent).
  - `merge-props.ts`: Handles event handler composition and prop merging.
  - `use-focusable-when-disabled.ts`: Shared logic for focus management.
- `vue/packages/core/src/utils/`: Component-specific shared logic.
  - `types.ts`: Foundational Base UI Vue types.
  - `getStateAttributesProps.ts`: Logic for mapping state (e.g., `{ disabled: true }`) to `data-*` attributes.
- `vue/packages/core/src/use-button/`: Dedicated folder for the button logic hook.
- `vue/packages/core/src/button/`: The SFC component and its types.

## 2. Architectural Decisions

### Polymorphism (`as` prop vs `render` prop)
- **React**: Uses a `render` prop which accepts a React element or function.
- **Vue**: Adopted the `as` prop pattern using `<component :is="...">`. This is the "Vue way" for unstyled components, allowing users to pass a string (tag) or a Vue Component. It's more idiomatic than cloning VNodes in Vue.

### Prop Merging & Event Composition
- Implemented `mergeProps` in the `plugins` package.
- Supports the `preventBaseUIHandler` pattern. This allows a user to provide an `@click` handler that can call `event.preventBaseUIHandler()` to stop the internal Base UI logic from executing, mirroring the React version's capability.

### `nativeButton` Prop
- Kept the `nativeButton` prop for parity.
- **Auto-inference**: If `nativeButton` is undefined, it defaults to `true` if `as="button"` and `false` otherwise. This simplifies usage while allowing manual overrides if a user passes a custom component that they want treated as a native button.

### Component Naming
- Internally named `BaseUIButton` to avoid conflicts with the native HTML `<button>` element during global registration in documentation environments like VitePress.

## 3. `useRenderElement` vs. Vue
The React version uses a complex `useRenderElement` hook to handle polymorphism, ref merging, and state attributes.
- **Vue implementation**: Simplified this by using Vue's built-in `v-bind` and `<component :is>`. Ref merging is handled via a single `buttonRef` passed to the template. State attributes are computed and spread via `v-bind`.

## 4. Accessibility & Focus Management
- **Focusable when disabled**: Ported the logic that removes the native `disabled` attribute but adds `aria-disabled="true"` and `tabindex="0"` when the component should remain focusable (e.g., during loading states).
- **Keyboard support**: For non-native buttons (like `as="div"`), the component automatically handles `Enter` and `Space` keys to trigger click events, ensuring full A11y parity.

## 5. Verification
- **Unit Tests**: Ported using `vitest` and `@vue/test-utils`, covering:
  - Native button disabled state.
  - Custom element (polymorphic) disabled state.
  - `focusableWhenDisabled` behavior for both native and custom elements.
- **Documentation**: Integrated a live preview in VitePress with plain CSS (no Tailwind dependency).
