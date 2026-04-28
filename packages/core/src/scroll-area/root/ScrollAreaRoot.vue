<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { Coords, HiddenState, OverflowEdges, ScrollAreaRootContext, ScrollAreaRootState, Size } from './ScrollAreaRootContext'
import { computed, onMounted, provide, ref, shallowRef, useAttrs } from 'vue'
import { useCSPContext } from '../../csp-provider/CSPContext'
import { contains } from '../../floating-ui-vue/utils/shadowDom'
import { mergeProps } from '../../merge-props/mergeProps'
import { styleDisableScrollbar } from '../../utils/styles'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useRenderElement } from '../../utils/useRenderElement'
import { SCROLL_TIMEOUT } from '../constants'
import { ScrollAreaScrollbarDataAttributes } from '../scrollbar/ScrollAreaScrollbarDataAttributes'
import { getOffset } from '../utils/getOffset'
import { scrollAreaRootContextKey } from './ScrollAreaRootContext'
import { ScrollAreaRootCssVars } from './ScrollAreaRootCssVars'
import { scrollAreaStateAttributesMapping } from './stateAttributes'

defineOptions({
  name: 'ScrollAreaRoot',
  inheritAttrs: false,
})
const props = withDefaults(defineProps<ScrollAreaRootProps>(), {
  as: 'div',
})
const DEFAULT_SIZE: Size = { width: 0, height: 0 }
const DEFAULT_OVERFLOW_EDGES: OverflowEdges = { xStart: false, xEnd: false, yStart: false, yEnd: false }
const DEFAULT_HIDDEN_STATE: HiddenState = { x: true, y: true, corner: true }
const DEFAULT_COORDS: Coords = { x: 0, y: 0 }

export interface ScrollAreaRootProps extends BaseUIComponentProps<ScrollAreaRootState> {
  overflowEdgeThreshold?:
    | number
    | Partial<{
      xStart: number
      xEnd: number
      yStart: number
      yEnd: number
    }>
}

const attrs = useAttrs()

const overflowEdgeThreshold = computed(() => normalizeOverflowEdgeThreshold(props.overflowEdgeThreshold))

const rootId = useBaseUiId()
const { nonce, disableStyleElements } = useCSPContext()

const hovering = ref(false)
const scrollingX = ref(false)
const scrollingY = ref(false)
const touchModality = ref(false)
const hasMeasuredScrollbar = ref(false)
const cornerSize = ref<Size>({ ...DEFAULT_SIZE })
const thumbSize = ref<Size>({ ...DEFAULT_SIZE })
const overflowEdges = ref<OverflowEdges>({ ...DEFAULT_OVERFLOW_EDGES })
const hiddenState = ref<HiddenState>({ ...DEFAULT_HIDDEN_STATE })

const rootRef = shallowRef<HTMLDivElement | null>(null)
const viewportRef = shallowRef<HTMLDivElement | null>(null)
const scrollbarYRef = shallowRef<HTMLDivElement | null>(null)
const scrollbarXRef = shallowRef<HTMLDivElement | null>(null)
const thumbYRef = shallowRef<HTMLDivElement | null>(null)
const thumbXRef = shallowRef<HTMLDivElement | null>(null)
const cornerRef = shallowRef<HTMLDivElement | null>(null)

let scrollYTimeoutId: ReturnType<typeof setTimeout> | undefined
let scrollXTimeoutId: ReturnType<typeof setTimeout> | undefined

const thumbDragging = { current: false }
const startY = { current: 0 }
const startX = { current: 0 }
const startScrollTop = { current: 0 }
const startScrollLeft = { current: 0 }
const currentOrientation = { current: 'vertical' as 'vertical' | 'horizontal' }
const scrollPosition = { current: { ...DEFAULT_COORDS } }

function handleScroll(pos: Coords) {
  const offsetX = pos.x - scrollPosition.current.x
  const offsetY = pos.y - scrollPosition.current.y
  scrollPosition.current = pos

  if (offsetY !== 0) {
    scrollingY.value = true
    clearTimeout(scrollYTimeoutId)
    scrollYTimeoutId = setTimeout(() => {
      scrollingY.value = false
    }, SCROLL_TIMEOUT)
  }

  if (offsetX !== 0) {
    scrollingX.value = true
    clearTimeout(scrollXTimeoutId)
    scrollXTimeoutId = setTimeout(() => {
      scrollingX.value = false
    }, SCROLL_TIMEOUT)
  }
}

function handlePointerDown(event: PointerEvent) {
  if (event.button !== 0)
    return

  thumbDragging.current = true
  startY.current = event.clientY
  startX.current = event.clientX
  currentOrientation.current = (event.currentTarget as Element).getAttribute(
    ScrollAreaScrollbarDataAttributes.orientation,
  ) as 'vertical' | 'horizontal'

  if (viewportRef.value) {
    startScrollTop.current = viewportRef.value.scrollTop
    startScrollLeft.current = viewportRef.value.scrollLeft
  }
  if (thumbYRef.value && currentOrientation.current === 'vertical') {
    thumbYRef.value.setPointerCapture(event.pointerId)
  }
  if (thumbXRef.value && currentOrientation.current === 'horizontal') {
    thumbXRef.value.setPointerCapture(event.pointerId)
  }
}

function handlePointerMove(event: PointerEvent) {
  if (!thumbDragging.current)
    return

  const deltaY = event.clientY - startY.current
  const deltaX = event.clientX - startX.current

  if (viewportRef.value) {
    const scrollableContentHeight = viewportRef.value.scrollHeight
    const viewportHeight = viewportRef.value.clientHeight
    const scrollableContentWidth = viewportRef.value.scrollWidth
    const viewportWidth = viewportRef.value.clientWidth

    if (thumbYRef.value && scrollbarYRef.value && currentOrientation.current === 'vertical') {
      const scrollbarYOffset = getOffset(scrollbarYRef.value, 'padding', 'y')
      const thumbYOffset = getOffset(thumbYRef.value, 'margin', 'y')
      const thumbHeight = thumbYRef.value.offsetHeight
      const maxThumbOffsetY = scrollbarYRef.value.offsetHeight - thumbHeight - scrollbarYOffset - thumbYOffset
      const scrollRatioY = deltaY / maxThumbOffsetY
      viewportRef.value.scrollTop = startScrollTop.current + scrollRatioY * (scrollableContentHeight - viewportHeight)
      event.preventDefault()
      scrollingY.value = true
      clearTimeout(scrollYTimeoutId)
      scrollYTimeoutId = setTimeout(() => {
        scrollingY.value = false
      }, SCROLL_TIMEOUT)
    }

    if (thumbXRef.value && scrollbarXRef.value && currentOrientation.current === 'horizontal') {
      const scrollbarXOffset = getOffset(scrollbarXRef.value, 'padding', 'x')
      const thumbXOffset = getOffset(thumbXRef.value, 'margin', 'x')
      const thumbWidth = thumbXRef.value.offsetWidth
      const maxThumbOffsetX = scrollbarXRef.value.offsetWidth - thumbWidth - scrollbarXOffset - thumbXOffset
      const scrollRatioX = deltaX / maxThumbOffsetX
      viewportRef.value.scrollLeft = startScrollLeft.current + scrollRatioX * (scrollableContentWidth - viewportWidth)
      event.preventDefault()
      scrollingX.value = true
      clearTimeout(scrollXTimeoutId)
      scrollXTimeoutId = setTimeout(() => {
        scrollingX.value = false
      }, SCROLL_TIMEOUT)
    }
  }
}

function handlePointerUp(event: PointerEvent) {
  thumbDragging.current = false
  if (thumbYRef.value && currentOrientation.current === 'vertical') {
    thumbYRef.value.releasePointerCapture(event.pointerId)
  }
  if (thumbXRef.value && currentOrientation.current === 'horizontal') {
    thumbXRef.value.releasePointerCapture(event.pointerId)
  }
}

function handleTouchModalityChange(event: PointerEvent) {
  touchModality.value = event.pointerType === 'touch'
}

function handlePointerEnterOrMove(event: PointerEvent) {
  handleTouchModalityChange(event)
  if (event.pointerType !== 'touch') {
    const isTargetRootChild = contains(rootRef.value, event.target as Element)
    hovering.value = isTargetRootChild
  }
}

const state = computed<ScrollAreaRootState>(() => ({
  scrolling: scrollingX.value || scrollingY.value,
  hasOverflowX: !hiddenState.value.x,
  hasOverflowY: !hiddenState.value.y,
  overflowXStart: overflowEdges.value.xStart,
  overflowXEnd: overflowEdges.value.xEnd,
  overflowYStart: overflowEdges.value.yStart,
  overflowYEnd: overflowEdges.value.yEnd,
  cornerHidden: hiddenState.value.corner,
}))

const elementProps = computed(() => mergeProps(
  attrs as Record<string, any>,
  {
    role: 'presentation',
    onPointerenter: handlePointerEnterOrMove,
    onPointermove: handlePointerEnterOrMove,
    onPointerdown: handleTouchModalityChange,
    onPointerleave: () => { hovering.value = false },
    style: {
      position: 'relative',
      [ScrollAreaRootCssVars.scrollAreaCornerHeight]: `${cornerSize.value.height}px`,
      [ScrollAreaRootCssVars.scrollAreaCornerWidth]: `${cornerSize.value.width}px`,
    },
  },
))

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: elementProps,
  stateAttributesMapping: scrollAreaStateAttributesMapping,
  defaultTagName: 'div',
  ref: rootRef,
})

onMounted(() => {
  styleDisableScrollbar.inject(nonce.value, disableStyleElements.value)
})

const contextValue: ScrollAreaRootContext = {
  cornerSize,
  setCornerSize: (size: Size) => { cornerSize.value = size },
  thumbSize,
  setThumbSize: (size: Size) => { thumbSize.value = size },
  hasMeasuredScrollbar,
  setHasMeasuredScrollbar: (value: boolean) => { hasMeasuredScrollbar.value = value },
  touchModality,
  hovering,
  setHovering: (value: boolean) => { hovering.value = value },
  scrollingX,
  setScrollingX: (value: boolean) => { scrollingX.value = value },
  scrollingY,
  setScrollingY: (value: boolean) => { scrollingY.value = value },
  viewportRef,
  rootRef,
  scrollbarYRef,
  scrollbarXRef,
  thumbYRef,
  thumbXRef,
  cornerRef,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handleScroll,
  rootId,
  hiddenState,
  setHiddenState: (s: HiddenState) => { hiddenState.value = s },
  overflowEdges,
  setOverflowEdges: (e: OverflowEdges) => { overflowEdges.value = e },
  viewportState: state,
  overflowEdgeThreshold,
}

provide(scrollAreaRootContextKey, contextValue)

function normalizeOverflowEdgeThreshold(
  threshold: ScrollAreaRootProps['overflowEdgeThreshold'],
) {
  if (typeof threshold === 'number') {
    const value = Math.max(0, threshold)
    return { xStart: value, xEnd: value, yStart: value, yEnd: value }
  }
  return {
    xStart: Math.max(0, threshold?.xStart || 0),
    xEnd: Math.max(0, threshold?.xEnd || 0),
    yStart: Math.max(0, threshold?.yStart || 0),
    yEnd: Math.max(0, threshold?.yEnd || 0),
  }
}
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component
    :is="tag"
    v-else
    :ref="renderRef"
    v-bind="mergedProps"
  >
    <slot />
  </component>
</template>
