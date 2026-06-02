import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface NumberFieldScrubAreaContext {
  isScrubbing: Readonly<Ref<boolean>>
  isTouchInput: Readonly<Ref<boolean>>
  isPointerLockDenied: Readonly<Ref<boolean>>
  scrubAreaCursorRef: Ref<HTMLElement | null>
  scrubAreaRef: Ref<HTMLElement | null>
  direction: ComputedRef<'horizontal' | 'vertical'>
  pixelSensitivity: ComputedRef<number>
  teleportDistance: ComputedRef<number | undefined>
}

export const numberFieldScrubAreaContextKey: InjectionKey<NumberFieldScrubAreaContext>
  = Symbol('NumberFieldScrubAreaContext')

export function useNumberFieldScrubAreaContext() {
  const context = inject(numberFieldScrubAreaContextKey, undefined)
  if (context === undefined) {
    throw new Error(
      'Base UI Vue: NumberFieldScrubAreaContext is missing. NumberFieldScrubArea parts must be placed within <NumberFieldScrubArea>.',
    )
  }
  return context
}
