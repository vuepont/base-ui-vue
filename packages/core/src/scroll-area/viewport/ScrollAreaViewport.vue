<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { HiddenState, ScrollAreaRootState } from '../root/ScrollAreaRootContext'
import { computed, onBeforeUnmount, onMounted, provide, useAttrs, watch } from 'vue'
import { useDirection } from '../../direction-provider/DirectionContext'
import { mergeProps } from '../../merge-props/mergeProps'
import { clamp } from '../../utils/clamp'
import { normalizeScrollOffset } from '../../utils/scrollEdges'
import { styleDisableScrollbar } from '../../utils/styles'
import { useRenderElement } from '../../utils/useRenderElement'
import { MIN_THUMB_SIZE } from '../constants'
import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext'
import { scrollAreaStateAttributesMapping } from '../root/stateAttributes'
import { getOffset } from '../utils/getOffset'
import { scrollAreaViewportContextKey } from './ScrollAreaViewportContext'
import { ScrollAreaViewportCssVars } from './ScrollAreaViewportCssVars'

export type ScrollAreaViewportState = ScrollAreaRootState

export interface ScrollAreaViewportProps extends BaseUIComponentProps<ScrollAreaViewportState> {}

defineOptions({
  name: 'ScrollAreaViewport',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ScrollAreaViewportProps>(), {
  as: 'div',
})

const attrs = useAttrs()

const {
  viewportRef,
  scrollbarYRef,
  scrollbarXRef,
  thumbYRef,
  thumbXRef,
  cornerRef,
  cornerSize,
  setCornerSize,
  setThumbSize,
  rootId,
  setHiddenState,
  hiddenState,
  setHasMeasuredScrollbar,
  handleScroll,
  setHovering,
  setOverflowEdges,
  overflowEdges,
  overflowEdgeThreshold,
  scrollingX,
  scrollingY,
} = useScrollAreaRootContext()

const direction = useDirection()

let programmaticScroll = true
const lastMeasuredViewportMetrics: [number, number, number, number] = [Number.NaN, Number.NaN, Number.NaN, Number.NaN]

let scrollEndTimeoutId: ReturnType<typeof setTimeout> | undefined
let waitForAnimationsTimeoutId: ReturnType<typeof setTimeout> | undefined
let resizeObserver: ResizeObserver | undefined

let scrollAreaOverflowVarsRegistered = false

function removeCSSVariableInheritance() {
  if (scrollAreaOverflowVarsRegistered)
    return

  const isWebKit = typeof navigator !== 'undefined' && /AppleWebKit/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
  if (isWebKit)
    return

  if (typeof CSS !== 'undefined' && 'registerProperty' in CSS) {
    const vars = [
      ScrollAreaViewportCssVars.scrollAreaOverflowXStart,
      ScrollAreaViewportCssVars.scrollAreaOverflowXEnd,
      ScrollAreaViewportCssVars.scrollAreaOverflowYStart,
      ScrollAreaViewportCssVars.scrollAreaOverflowYEnd,
    ]
    for (const name of vars) {
      try {
        CSS.registerProperty({ name, syntax: '<length>', inherits: false, initialValue: '0px' })
      }
      catch { /* already registered */ }
    }
  }

  scrollAreaOverflowVarsRegistered = true
}

function computeThumbPosition() {
  const viewportEl = viewportRef.value
  const scrollbarYEl = scrollbarYRef.value
  const scrollbarXEl = scrollbarXRef.value
  const thumbYEl = thumbYRef.value
  const thumbXEl = thumbXRef.value
  const cornerEl = cornerRef.value

  if (!viewportEl)
    return

  const scrollableContentHeight = viewportEl.scrollHeight
  const scrollableContentWidth = viewportEl.scrollWidth
  const viewportHeight = viewportEl.clientHeight
  const viewportWidth = viewportEl.clientWidth
  const scrollTop = viewportEl.scrollTop
  const scrollLeft = viewportEl.scrollLeft
  const isFirstMeasurement = Number.isNaN(lastMeasuredViewportMetrics[0])
  lastMeasuredViewportMetrics[0] = viewportHeight
  lastMeasuredViewportMetrics[1] = scrollableContentHeight
  lastMeasuredViewportMetrics[2] = viewportWidth
  lastMeasuredViewportMetrics[3] = scrollableContentWidth

  if (isFirstMeasurement) {
    setHasMeasuredScrollbar(true)
  }

  if (scrollableContentHeight === 0 || scrollableContentWidth === 0)
    return

  const nextHiddenState = getHiddenState(viewportEl)
  const scrollbarYHidden = nextHiddenState.y
  const scrollbarXHidden = nextHiddenState.x
  const ratioX = viewportWidth / scrollableContentWidth
  const ratioY = viewportHeight / scrollableContentHeight
  const maxScrollLeft = Math.max(0, scrollableContentWidth - viewportWidth)
  const maxScrollTop = Math.max(0, scrollableContentHeight - viewportHeight)

  let scrollLeftFromStart = 0
  let scrollLeftFromEnd = 0
  if (!scrollbarXHidden) {
    let rawScrollLeftFromStart = 0
    if (direction.value === 'rtl') {
      rawScrollLeftFromStart = scrollLeft < 0 ? -scrollLeft : maxScrollLeft - scrollLeft
    }
    else {
      rawScrollLeftFromStart = scrollLeft
    }
    rawScrollLeftFromStart = clamp(rawScrollLeftFromStart, 0, maxScrollLeft)
    scrollLeftFromStart = normalizeScrollOffset(rawScrollLeftFromStart, maxScrollLeft)
    scrollLeftFromEnd = maxScrollLeft - scrollLeftFromStart
  }

  const rawScrollTopFromStart = !scrollbarYHidden ? clamp(scrollTop, 0, maxScrollTop) : 0
  const scrollTopFromStart = !scrollbarYHidden ? normalizeScrollOffset(rawScrollTopFromStart, maxScrollTop) : 0
  const scrollTopFromEnd = !scrollbarYHidden ? maxScrollTop - scrollTopFromStart : 0
  const nextWidth = scrollbarXHidden ? 0 : viewportWidth
  const nextHeight = scrollbarYHidden ? 0 : viewportHeight

  let nextCornerWidth = 0
  let nextCornerHeight = 0
  if (!scrollbarXHidden && !scrollbarYHidden) {
    nextCornerWidth = scrollbarYEl?.offsetWidth || 0
    nextCornerHeight = scrollbarXEl?.offsetHeight || 0
  }

  const cornerNotYetSized = cornerSize.value.width === 0 && cornerSize.value.height === 0
  const cornerWidthOffset = cornerNotYetSized ? nextCornerWidth : 0
  const cornerHeightOffset = cornerNotYetSized ? nextCornerHeight : 0

  const scrollbarXOffset = getOffset(scrollbarXEl, 'padding', 'x')
  const scrollbarYOffset = getOffset(scrollbarYEl, 'padding', 'y')
  const thumbXOffset = getOffset(thumbXEl, 'margin', 'x')
  const thumbYOffset = getOffset(thumbYEl, 'margin', 'y')

  const idealNextWidth = nextWidth - scrollbarXOffset - thumbXOffset
  const idealNextHeight = nextHeight - scrollbarYOffset - thumbYOffset

  const maxNextWidth = scrollbarXEl ? Math.min(scrollbarXEl.offsetWidth - cornerWidthOffset, idealNextWidth) : idealNextWidth
  const maxNextHeight = scrollbarYEl ? Math.min(scrollbarYEl.offsetHeight - cornerHeightOffset, idealNextHeight) : idealNextHeight

  const clampedNextWidth = Math.max(MIN_THUMB_SIZE, maxNextWidth * ratioX)
  const clampedNextHeight = Math.max(MIN_THUMB_SIZE, maxNextHeight * ratioY)

  setThumbSize({ width: clampedNextWidth, height: clampedNextHeight })

  if (scrollbarYEl && thumbYEl) {
    const maxThumbOffsetY = scrollbarYEl.offsetHeight - clampedNextHeight - scrollbarYOffset - thumbYOffset
    const scrollRangeY = scrollableContentHeight - viewportHeight
    const scrollRatioY = scrollRangeY === 0 ? 0 : scrollTop / scrollRangeY
    const thumbOffsetY = Math.min(maxThumbOffsetY, Math.max(0, scrollRatioY * maxThumbOffsetY))
    thumbYEl.style.transform = `translate3d(0,${thumbOffsetY}px,0)`
  }

  if (scrollbarXEl && thumbXEl) {
    const maxThumbOffsetX = scrollbarXEl.offsetWidth - clampedNextWidth - scrollbarXOffset - thumbXOffset
    const scrollRangeX = scrollableContentWidth - viewportWidth
    const scrollRatioX = scrollRangeX === 0 ? 0 : scrollLeftFromStart / scrollRangeX
    const thumbOffsetX = direction.value === 'rtl'
      ? -clamp(scrollRatioX * maxThumbOffsetX, 0, maxThumbOffsetX)
      : clamp(scrollRatioX * maxThumbOffsetX, 0, maxThumbOffsetX)
    thumbXEl.style.transform = `translate3d(${thumbOffsetX}px,0,0)`
  }

  const overflowMetricsPx: Array<[string, number]> = [
    [ScrollAreaViewportCssVars.scrollAreaOverflowXStart, scrollLeftFromStart],
    [ScrollAreaViewportCssVars.scrollAreaOverflowXEnd, scrollLeftFromEnd],
    [ScrollAreaViewportCssVars.scrollAreaOverflowYStart, scrollTopFromStart],
    [ScrollAreaViewportCssVars.scrollAreaOverflowYEnd, scrollTopFromEnd],
  ]

  for (const [cssVar, value] of overflowMetricsPx) {
    viewportEl.style.setProperty(cssVar, `${value}px`)
  }

  if (cornerEl) {
    if (scrollbarXHidden || scrollbarYHidden) {
      setCornerSize({ width: 0, height: 0 })
    }
    else {
      setCornerSize({ width: nextCornerWidth, height: nextCornerHeight })
    }
  }

  setHiddenState(mergeHiddenState(hiddenState.value, nextHiddenState))

  const threshold = overflowEdgeThreshold.value
  const nextOverflowEdges = {
    xStart: !scrollbarXHidden && scrollLeftFromStart > threshold.xStart,
    xEnd: !scrollbarXHidden && scrollLeftFromEnd > threshold.xEnd,
    yStart: !scrollbarYHidden && scrollTopFromStart > threshold.yStart,
    yEnd: !scrollbarYHidden && scrollTopFromEnd > threshold.yEnd,
  }

  const prev = overflowEdges.value
  if (
    prev.xStart !== nextOverflowEdges.xStart
    || prev.xEnd !== nextOverflowEdges.xEnd
    || prev.yStart !== nextOverflowEdges.yStart
    || prev.yEnd !== nextOverflowEdges.yEnd
  ) {
    setOverflowEdges(nextOverflowEdges)
  }
}

function handleUserInteraction() {
  programmaticScroll = false
}

function onScroll() {
  if (!viewportRef.value)
    return

  computeThumbPosition()

  if (!programmaticScroll) {
    handleScroll({
      x: viewportRef.value.scrollLeft,
      y: viewportRef.value.scrollTop,
    })
  }

  clearTimeout(scrollEndTimeoutId)
  scrollEndTimeoutId = setTimeout(() => {
    programmaticScroll = true
  }, 100)
}

const viewportState = computed<ScrollAreaViewportState>(() => ({
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
    ...(rootId ? { 'data-id': `${rootId}-viewport` } : {}),
    tabindex: hiddenState.value.x && hiddenState.value.y ? -1 : 0,
    class: styleDisableScrollbar.className,
    style: { overflow: 'scroll' },
    onScroll,
    onWheel: handleUserInteraction,
    onTouchmove: handleUserInteraction,
    onPointermove: handleUserInteraction,
    onPointerenter: handleUserInteraction,
    onKeydown: handleUserInteraction,
  },
))

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state: viewportState,
  props: elementProps,
  stateAttributesMapping: scrollAreaStateAttributesMapping,
  defaultTagName: 'div',
  ref: viewportRef,
})

onMounted(() => {
  removeCSSVariableInheritance()

  if (viewportRef.value?.matches(':hover')) {
    setHovering(true)
  }

  queueMicrotask(computeThumbPosition)

  const viewport = viewportRef.value
  if (typeof ResizeObserver !== 'undefined' && viewport) {
    let hasInitialized = false
    resizeObserver = new ResizeObserver(() => {
      if (!hasInitialized) {
        hasInitialized = true
        if (
          lastMeasuredViewportMetrics[0] === viewport.clientHeight
          && lastMeasuredViewportMetrics[1] === viewport.scrollHeight
          && lastMeasuredViewportMetrics[2] === viewport.clientWidth
          && lastMeasuredViewportMetrics[3] === viewport.scrollWidth
        ) {
          return
        }
      }
      computeThumbPosition()
    })
    resizeObserver.observe(viewport)

    waitForAnimationsTimeoutId = setTimeout(() => {
      const animations = viewport.getAnimations({ subtree: true })
      if (animations.length === 0)
        return
      Promise.allSettled(animations.map(a => a.finished))
        .then(computeThumbPosition)
    }, 0)
  }
})

watch([hiddenState, direction], () => {
  queueMicrotask(computeThumbPosition)
})

watch(overflowEdgeThreshold, computeThumbPosition)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  clearTimeout(scrollEndTimeoutId)
  clearTimeout(waitForAnimationsTimeoutId)
})

provide(scrollAreaViewportContextKey, { computeThumbPosition })

function getHiddenState(viewport: HTMLElement): HiddenState {
  const y = viewport.clientHeight >= viewport.scrollHeight
  const x = viewport.clientWidth >= viewport.scrollWidth
  return { y, x, corner: y || x }
}

function mergeHiddenState(prevState: HiddenState, nextState: HiddenState): HiddenState {
  if (prevState.y === nextState.y && prevState.x === nextState.x && prevState.corner === nextState.corner) {
    return prevState
  }
  return nextState
}
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="viewportState" />
  <component
    :is="tag"
    v-else
    :ref="renderRef"
    v-bind="mergedProps"
  >
    <slot />
  </component>
</template>
