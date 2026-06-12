import type { InjectionKey } from 'vue'
import type { UseAnchorPositioningReturnValue } from '../../utils/useAnchorPositioning'
import { inject } from 'vue'

export type TooltipPositionerContext = Pick<
  UseAnchorPositioningReturnValue,
  'side' | 'align' | 'arrowRef' | 'arrowUncentered' | 'arrowStyles'
>

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
