import type { Component, StyleValue } from 'vue'
import type { BaseUIEvent, HTMLProps } from '../types'

export type { BaseUIEvent, HTMLProps }

export type Orientation = 'horizontal' | 'vertical'

/**
 * Props shared by all Base UI Vue components.
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
export interface NonNativeButtonProps {
  /**
   * Whether the component renders a native `<button>` element when replaceing it.
   *  via the `as` prop.
   * Set to `true` if the rendered element is a native button.
   * @default false
   */
  nativeButton?: boolean
}
