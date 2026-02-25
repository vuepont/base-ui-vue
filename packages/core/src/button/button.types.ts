import type { BaseUIComponentProps, NativeButtonProps } from "../utils/types";

export interface ButtonState {
  /**
   * Whether the button should ignore user interaction.
   */
  disabled: boolean;
}

export interface ButtonProps
  extends NativeButtonProps, BaseUIComponentProps<ButtonState> {
  /**
   * Whether the button should ignore user interaction.
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether the button should be focusable when disabled.
   * @default false
   */
  focusableWhenDisabled?: boolean;
}

export namespace Button {
  export type State = ButtonState;
  export type Props = ButtonProps;
}
