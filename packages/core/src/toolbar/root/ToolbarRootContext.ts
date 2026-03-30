import type { InjectionKey, Ref } from 'vue'
import type { Orientation } from '../../utils/types'
import { inject } from 'vue'

export interface ToolbarRootItemMetadata {
  focusableWhenDisabled: boolean
}

export interface ToolbarRootContext {
  disabled: Ref<boolean>
  orientation: Ref<Orientation>
}

export const toolbarRootContextKey: InjectionKey<ToolbarRootContext>
  = Symbol('ToolbarRootContext')

export function useToolbarRootContext(optional: true): ToolbarRootContext | undefined
export function useToolbarRootContext(optional?: false): ToolbarRootContext
export function useToolbarRootContext(optional = false) {
  const context = inject(toolbarRootContextKey, undefined)

  if (context === undefined && !optional) {
    throw new Error(
      'Base UI Vue: ToolbarRootContext is missing. Toolbar parts must be placed within <ToolbarRoot>.',
    )
  }

  return context
}
