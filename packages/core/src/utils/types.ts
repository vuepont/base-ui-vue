import type { Component, HTMLAttributes, StyleValue } from 'vue'

export type HTMLProps = HTMLAttributes & {
  ref?: any
}

export interface BaseUIEvent<T = Event> {
  baseUIHandlerPrevented?: boolean
  preventBaseUIHandler?: () => void
  nativeEvent: T
}

/**
 * Props shared by all Base UI components.
 */
export interface BaseUIComponentProps<State> {
  /**
   * The element or component to use for the root node.
   */
  as?: string | Component
  /**
   * CSS class applied to the element, or a function that
   * returns a class based on the component’s state.
   */
  class?: any | ((state: State) => any)
  /**
   * Style applied to the element, or a function that
   * returns a style object based on the component’s state.
   */
  style?: StyleValue | ((state: State) => StyleValue)
}

export interface NativeButtonProps {
  /**
   * Whether the component renders a native `<button>` element when replaceing it.
   *  via the `as` prop.
   * Set to `true` if the rendered element is a native button.
   * @default true
   */
  nativeButton?: boolean
}
