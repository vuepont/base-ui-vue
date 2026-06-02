export { default as OtpFieldInput } from './input/OtpFieldInput.vue'
export type { OtpFieldInputProps, OtpFieldInputState } from './input/OtpFieldInput.vue'

export { default as OtpFieldRoot } from './root/OtpFieldRoot.vue'
export type { OtpFieldRootProps, OtpFieldRootState } from './root/OtpFieldRoot.vue'

export {
  getOtpFieldInputState,
  otpFieldRootContextKey,
  useOtpFieldRootContext,
} from './root/OtpFieldRootContext'
export type {
  OtpFieldRootChangeEventDetails,
  OtpFieldRootChangeEventReason,
  OtpFieldRootCompleteEventDetails,
  OtpFieldRootCompleteEventReason,
  OtpFieldRootContext,
  OtpFieldRootInvalidEventDetails,
  OtpFieldRootInvalidEventReason,
} from './root/OtpFieldRootContext'

export type { OtpValidationType } from './utils/otp'
