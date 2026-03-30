import CheckboxIndicator from './indicator/CheckboxIndicator.vue'
import CheckboxRoot from './root/CheckboxRoot.vue'

export { default as CheckboxIndicator } from './indicator/CheckboxIndicator.vue'
export { default as Indicator } from './indicator/CheckboxIndicator.vue'
export type {
  CheckboxIndicatorProps,
  CheckboxIndicatorState,
} from './indicator/CheckboxIndicator.vue'
export { CheckboxIndicatorDataAttributes } from './indicator/CheckboxIndicatorDataAttributes'

export { default as CheckboxRoot } from './root/CheckboxRoot.vue'
export { default as Root } from './root/CheckboxRoot.vue'
export type { CheckboxRootProps, CheckboxRootState } from './root/CheckboxRoot.vue'
export { checkboxRootContextKey, useCheckboxRootContext } from './root/CheckboxRootContext'

export type { CheckboxRootContext } from './root/CheckboxRootContext'
export { CheckboxRootDataAttributes } from './root/CheckboxRootDataAttributes'

export const Checkbox = {
  Root: CheckboxRoot,
  Indicator: CheckboxIndicator,
} as const
