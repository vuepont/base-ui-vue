export enum CheckboxRootDataAttributes {
  /**
   * Present when the checkbox is checked.
   */
  checked = 'data-checked',
  /**
   * Present when the checkbox is not checked.
   */
  unchecked = 'data-unchecked',
  /**
   * Present when the checkbox is in an indeterminate state.
   */
  indeterminate = 'data-indeterminate',
  /**
   * Present when the checkbox is disabled.
   */
  disabled = 'data-disabled',
  /**
   * Present when the checkbox is readonly.
   */
  readonly = 'data-readonly',
  /**
   * Present when the checkbox is required.
   */
  required = 'data-required',
  /**
   * Present when the checkbox is in valid state (when wrapped in FieldRoot).
   */
  valid = 'data-valid',
  /**
   * Present when the checkbox is in invalid state (when wrapped in FieldRoot).
   */
  invalid = 'data-invalid',
  /**
   * Present when the checkbox has been touched (when wrapped in FieldRoot).
   */
  touched = 'data-touched',
  /**
   * Present when the checkbox's value has changed (when wrapped in FieldRoot).
   */
  dirty = 'data-dirty',
  /**
   * Present when the checkbox is checked (when wrapped in FieldRoot).
   */
  filled = 'data-filled',
  /**
   * Present when the checkbox is focused (when wrapped in FieldRoot).
   */
  focused = 'data-focused',
  /**
   * Present when the checkbox is acting as the parent checkbox for a group.
   */
  parent = 'data-parent',
}
