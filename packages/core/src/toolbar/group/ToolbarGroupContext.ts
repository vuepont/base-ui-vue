import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface ToolbarGroupContext {
  disabled: Ref<boolean>
}

export const toolbarGroupContextKey: InjectionKey<ToolbarGroupContext>
  = Symbol('ToolbarGroupContext')

export function useToolbarGroupContext(): ToolbarGroupContext
export function useToolbarGroupContext(optional: true): ToolbarGroupContext | undefined
export function useToolbarGroupContext(optional = false) {
  const context = inject(toolbarGroupContextKey, undefined)

  if (context === undefined && !optional) {
    throw new Error(
      'Base UI Vue: ToolbarGroupContext is missing. ToolbarGroup parts must be placed within <ToolbarGroup>.',
    )
  }

  return context
}
