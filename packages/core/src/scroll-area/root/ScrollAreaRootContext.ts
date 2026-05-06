import type { ComputedRef, InjectionKey, Ref, ShallowRef } from 'vue'
import { inject } from 'vue'

export interface Coords {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface HiddenState {
  x: boolean
  y: boolean
  corner: boolean
}

export interface OverflowEdges {
  xStart: boolean
  xEnd: boolean
  yStart: boolean
  yEnd: boolean
}

export interface ScrollAreaRootContext {
  cornerSize: Ref<Size>
  setCornerSize: (size: Size) => void
  thumbSize: Ref<Size>
  setThumbSize: (size: Size) => void
  hasMeasuredScrollbar: Ref<boolean>
  setHasMeasuredScrollbar: (value: boolean) => void
  touchModality: Ref<boolean>
  hovering: Ref<boolean>
  setHovering: (value: boolean) => void
  scrollingX: Ref<boolean>
  setScrollingX: (value: boolean) => void
  scrollingY: Ref<boolean>
  setScrollingY: (value: boolean) => void
  viewportRef: ShallowRef<HTMLDivElement | null>
  rootRef: ShallowRef<HTMLDivElement | null>
  scrollbarYRef: ShallowRef<HTMLDivElement | null>
  scrollbarXRef: ShallowRef<HTMLDivElement | null>
  thumbYRef: ShallowRef<HTMLDivElement | null>
  thumbXRef: ShallowRef<HTMLDivElement | null>
  cornerRef: ShallowRef<HTMLDivElement | null>
  handlePointerDown: (event: PointerEvent) => void
  handlePointerMove: (event: PointerEvent) => void
  handlePointerUp: (event: PointerEvent) => void
  handleScroll: (scrollPosition: Coords) => void
  rootId: string | undefined
  hiddenState: Ref<HiddenState>
  setHiddenState: (state: HiddenState) => void
  overflowEdges: Ref<OverflowEdges>
  setOverflowEdges: (edges: OverflowEdges) => void
  viewportState: ComputedRef<ScrollAreaRootState>
  overflowEdgeThreshold: ComputedRef<{
    xStart: number
    xEnd: number
    yStart: number
    yEnd: number
  }>
}

export interface ScrollAreaRootState {
  scrolling: boolean
  hasOverflowX: boolean
  hasOverflowY: boolean
  overflowXStart: boolean
  overflowXEnd: boolean
  overflowYStart: boolean
  overflowYEnd: boolean
  cornerHidden: boolean
}

export const scrollAreaRootContextKey = Symbol(
  'ScrollAreaRootContext',
) as InjectionKey<ScrollAreaRootContext>

export function useScrollAreaRootContext(): ScrollAreaRootContext {
  const context = inject(scrollAreaRootContextKey)
  if (context === undefined) {
    throw new Error(
      'Base UI: ScrollAreaRootContext is missing. ScrollArea parts must be placed within <ScrollAreaRoot>.',
    )
  }
  return context
}
