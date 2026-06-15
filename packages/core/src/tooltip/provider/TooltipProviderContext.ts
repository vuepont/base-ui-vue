import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface TooltipProviderContext {
  delay: Ref<number | undefined>
  closeDelay: Ref<number | undefined>
  timeout: Readonly<Ref<number>>
  getOpenDelay: (triggerDelay: number | undefined) => { delay: number, instant: boolean }
  getCloseDelay: (triggerCloseDelay: number | undefined) => number
  notifyOpen: () => void
  notifyClose: () => void
}

export const tooltipProviderContextKey: InjectionKey<TooltipProviderContext>
  = Symbol('TooltipProviderContext')

export function useTooltipProviderContext(): TooltipProviderContext | undefined {
  return inject(tooltipProviderContextKey, undefined)
}
