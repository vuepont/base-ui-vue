export { default as SliderControl } from './control/SliderControl.vue'
export type { SliderControlProps, SliderControlState } from './control/SliderControl.vue'
export { SliderControlDataAttributes } from './control/SliderControlDataAttributes'
export { default as SliderIndicator } from './indicator/SliderIndicator.vue'
export type { SliderIndicatorProps, SliderIndicatorState } from './indicator/SliderIndicator.vue'

export { SliderIndicatorDataAttributes } from './indicator/SliderIndicatorDataAttributes'
export { default as SliderLabel } from './label/SliderLabel.vue'
export type { SliderLabelProps, SliderLabelState } from './label/SliderLabel.vue'

export { default as SliderRoot } from './root/SliderRoot.vue'
export type {
  SliderRootChangeEventDetails,
  SliderRootChangeEventReason,
  SliderRootCommitEventDetails,
  SliderRootCommitEventReason,
  SliderRootProps,
  SliderRootState,
} from './root/SliderRoot.vue'
export { sliderRootContextKey, useSliderRootContext } from './root/SliderRootContext'

export type { SliderRootContext } from './root/SliderRootContext'
export { SliderRootDataAttributes } from './root/SliderRootDataAttributes'
export { default as SliderThumb } from './thumb/SliderThumb.vue'

export type { SliderThumbProps, SliderThumbState, ThumbMetadata } from './thumb/SliderThumb.vue'
export { SliderThumbDataAttributes } from './thumb/SliderThumbDataAttributes'
export { default as SliderTrack } from './track/SliderTrack.vue'

export type { SliderTrackProps, SliderTrackState } from './track/SliderTrack.vue'
export { SliderTrackDataAttributes } from './track/SliderTrackDataAttributes'
export { default as SliderValue } from './value/SliderValue.vue'

export type { SliderValueProps, SliderValueState } from './value/SliderValue.vue'
export { SliderValueDataAttributes } from './value/SliderValueDataAttributes'
