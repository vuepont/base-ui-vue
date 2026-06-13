import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export type TooltipPortalContext = Ref<boolean>

export const tooltipPortalContextKey: InjectionKey<TooltipPortalContext>
  = Symbol('TooltipPortalContext')

export function useTooltipPortalContext(): TooltipPortalContext {
  const context = inject(tooltipPortalContextKey, undefined)

  if (context === undefined) {
    throw new Error(
      'Base UI Vue: <TooltipPortal> is missing.',
    )
  }

  return context
}
