import type { InjectionKey, Ref, ShallowRef } from 'vue'
import type { TooltipAlign, TooltipSide } from '../tooltip.types'
import { inject } from 'vue'

export interface TooltipPositionerContext {
  side: Ref<TooltipSide>
  align: Ref<TooltipAlign>
  arrowRef: Ref<HTMLElement | null>
  arrowX: ShallowRef<number | undefined>
  arrowY: ShallowRef<number | undefined>
  arrowUncentered: Ref<boolean>
}

export const tooltipPositionerContextKey: InjectionKey<TooltipPositionerContext>
  = Symbol('TooltipPositionerContext')

export function useTooltipPositionerContext(): TooltipPositionerContext {
  const context = inject(tooltipPositionerContextKey, undefined)

  if (context === undefined) {
    throw new Error(
      'Base UI Vue: TooltipPositionerContext is missing. <TooltipArrow> must be placed within <TooltipPositioner>.',
    )
  }

  return context
}
