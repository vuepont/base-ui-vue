import type { InjectionKey, Ref } from 'vue'
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import type { CollapsibleChangeEventDetails, CollapsibleRootState } from '../collapsible.types'
import { inject } from 'vue'

export type AnimationType = 'css-transition' | 'css-animation' | 'none' | null

export interface Dimensions {
  height: number | undefined
  width: number | undefined
}

export interface CollapsibleRootContext {
  open: Ref<boolean>
  disabled: Ref<boolean>
  panelId: Ref<string | undefined>
  state: Ref<CollapsibleRootState>
  handleTrigger: (event: MouseEvent | KeyboardEvent) => void
  mounted: Ref<boolean>
  setMounted: (next: boolean) => void
  transitionStatus: Ref<TransitionStatus>
  height: Ref<number | undefined>
  width: Ref<number | undefined>
  setDimensions: (dims: Dimensions) => void
  setOpen: (next: boolean) => void
  visible: Ref<boolean>
  setVisible: (next: boolean) => void
  keepMounted: Ref<boolean>
  setKeepMounted: (next: boolean) => void
  hiddenUntilFound: Ref<boolean>
  setHiddenUntilFound: (next: boolean) => void
  setPanelId: (id: string | undefined) => void
  animationTypeRef: Ref<AnimationType>
  panelRef: Ref<HTMLElement | null>
  abortControllerRef: Ref<AbortController | null>
  transitionDimensionRef: Ref<'width' | 'height' | null>
  runOnceAnimationsFinish: (fn: () => void, signal?: AbortSignal | null) => void
  onOpenChange: (open: boolean, details: CollapsibleChangeEventDetails) => void
}

export const collapsibleRootContextKey: InjectionKey<CollapsibleRootContext>
  = Symbol('CollapsibleRootContext')

export function useCollapsibleRootContext(): CollapsibleRootContext {
  const context = inject(collapsibleRootContextKey, undefined)
  if (context === undefined) {
    throw new Error(
      'Base UI Vue: CollapsibleRootContext is missing. Collapsible parts must be placed within <CollapsibleRoot>.',
    )
  }
  return context
}
