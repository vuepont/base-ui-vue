import RadioIndicator from './indicator/RadioIndicator.vue'
import RadioRoot from './root/RadioRoot.vue'

export { radioGroupContextKey, useRadioGroupContext } from '../radio-group/RadioGroupContext'
export type { RadioGroupContext } from '../radio-group/RadioGroupContext'
export { default as RadioIndicator } from './indicator/RadioIndicator.vue'

export type {
  RadioIndicatorProps,
  RadioIndicatorState,
} from './indicator/RadioIndicator.vue'
export { RadioIndicatorDataAttributes } from './indicator/RadioIndicatorDataAttributes'
export { default as RadioRoot } from './root/RadioRoot.vue'
export type {
  RadioRootChangeEventDetails,
  RadioRootChangeEventReason,
  RadioRootProps,
  RadioRootState,
} from './root/RadioRoot.vue'
export { radioRootContextKey, useRadioRootContext } from './root/RadioRootContext'

export type { RadioRootContext } from './root/RadioRootContext'
export { RadioRootDataAttributes } from './root/RadioRootDataAttributes'

export const Radio = {
  Root: RadioRoot,
  Indicator: RadioIndicator,
} as const
