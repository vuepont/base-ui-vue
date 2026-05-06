export enum InputDataAttributes {
  /**
   * Present when the input is disabled.
   */
  disabled = 'data-disabled',
  /**
   * Present when the input is in a valid state (when wrapped in FieldRoot).
   */
  valid = 'data-valid',
  /**
   * Present when the input is in an invalid state (when wrapped in FieldRoot).
   */
  invalid = 'data-invalid',
  /**
   * Present when the input has been touched (when wrapped in FieldRoot).
   */
  touched = 'data-touched',
  /**
   * Present when the input's value has changed (when wrapped in FieldRoot).
   */
  dirty = 'data-dirty',
  /**
   * Present when the input is filled (when wrapped in FieldRoot).
   */
  filled = 'data-filled',
  /**
   * Present when the input is focused (when wrapped in FieldRoot).
   */
  focused = 'data-focused',
}
