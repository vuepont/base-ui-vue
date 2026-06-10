import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export const tooltipPortalContextKey: InjectionKey<Ref<boolean>>
  = Symbol('TooltipPortalContext')

export function useTooltipPortalContext(): Ref<boolean> | undefined {
  return inject(tooltipPortalContextKey, undefined)
}
