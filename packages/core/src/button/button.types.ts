import type { BaseUIComponentProps } from '../utils/types'

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

export interface ButtonState {
  /**
   * Whether the button should ignore user interaction.
   */
  disabled: boolean
}

export interface ButtonProps
  extends NativeButtonProps, BaseUIComponentProps<ButtonState> {
  /**
   * Whether the button should ignore user interaction.
   * @default false
   */
  disabled?: boolean
  /**
   * Whether the button should be focusable when disabled.
   * @default false
   */
  focusableWhenDisabled?: boolean
}
