<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { BaseUIComponentProps } from '../../utils/types'
import type { ScrollAreaRootState } from '../root/ScrollAreaRootContext'
import { computed, onBeforeUnmount, provide, shallowRef, useAttrs, watch } from 'vue'
import { useDirection } from '../../direction-provider/DirectionContext'
import { contains, getTarget } from '../../floating-ui-vue/utils/shadowDom'
import { mergeProps } from '../../merge-props/mergeProps'
import { useRenderElement } from '../../utils/useRenderElement'
import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext'
import { ScrollAreaRootCssVars } from '../root/ScrollAreaRootCssVars'
import { scrollAreaStateAttributesMapping } from '../root/stateAttributes'
import { getOffset } from '../utils/getOffset'
import { scrollAreaScrollbarContextKey } from './ScrollAreaScrollbarContext'
import { ScrollAreaScrollbarCssVars } from './ScrollAreaScrollbarCssVars'

export interface ScrollAreaScrollbarState extends ScrollAreaRootState {
  hovering: boolean
  scrolling: boolean
  orientation: 'vertical' | 'horizontal'
}

export interface ScrollAreaScrollbarProps extends BaseUIComponentProps<ScrollAreaScrollbarState> {
  orientation?: 'vertical' | 'horizontal'
  keepMounted?: boolean
}

defineOptions({
  name: 'ScrollAreaScrollbar',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ScrollAreaScrollbarProps>(), {
  as: 'div',
  orientation: 'vertical',
  keepMounted: false,
})

const attrs = useAttrs()

const {
  hovering,
  scrollingX,
  scrollingY,
  hiddenState,
  overflowEdges,
  scrollbarYRef,
  scrollbarXRef,
  viewportRef,
  thumbYRef,
  thumbXRef,
  handlePointerDown,
  handlePointerUp,
  rootId,
  thumbSize,
  hasMeasuredScrollbar,
} = useScrollAreaRootContext()

const direction = useDirection()

let wheelCleanup: (() => void) | undefined
const scrollbarElementRef = shallowRef<HTMLDivElement | null>(null)

watch(
  [scrollbarElementRef, () => props.orientation],
  ([element, orientation], [previousElement, previousOrientation]) => {
    if (previousElement) {
      const previousRef = previousOrientation === 'vertical' ? scrollbarYRef : scrollbarXRef

      if (previousRef.value === previousElement) {
        previousRef.value = null
      }
    }

    if (!element) {
      return
    }

    const nextRef = orientation === 'vertical' ? scrollbarYRef : scrollbarXRef
    nextRef.value = element
  },
)

watch(
  [scrollbarElementRef, viewportRef, () => props.orientation],
  () => {
    wheelCleanup?.()
    wheelCleanup = setupWheelHandler()
  },
  { flush: 'post' },
)

onBeforeUnmount(() => {
  wheelCleanup?.()
})

function setupWheelHandler() {
  const viewportEl = viewportRef.value
  const scrollbarEl = scrollbarElementRef.value

  if (!scrollbarEl)
    return undefined

  function handleWheel(event: WheelEvent) {
    if (!viewportEl || !scrollbarEl || event.ctrlKey)
      return

    if (props.orientation === 'vertical') {
      if (viewportEl.scrollTop === 0 && event.deltaY < 0)
        return
      if (viewportEl.scrollTop === viewportEl.scrollHeight - viewportEl.clientHeight && event.deltaY > 0)
        return
      event.preventDefault()
      viewportEl.scrollTop += event.deltaY
    }
    else {
      if (viewportEl.scrollLeft === 0 && event.deltaX < 0)
        return
      if (viewportEl.scrollLeft === viewportEl.scrollWidth - viewportEl.clientWidth && event.deltaX > 0)
        return
      event.preventDefault()
      viewportEl.scrollLeft += event.deltaX
    }
  }

  scrollbarEl.addEventListener('wheel', handleWheel, { passive: false })
  return () => scrollbarEl.removeEventListener('wheel', handleWheel)
}

function setScrollbarElement(element: Element | ComponentPublicInstance | null) {
  scrollbarElementRef.value = element as HTMLDivElement | null
}

const state = computed<ScrollAreaScrollbarState>(() => ({
  hovering: hovering.value,
  scrolling: props.orientation === 'horizontal' ? scrollingX.value : scrollingY.value,
  orientation: props.orientation,
  hasOverflowX: !hiddenState.value.x,
  hasOverflowY: !hiddenState.value.y,
  overflowXStart: overflowEdges.value.xStart,
  overflowXEnd: overflowEdges.value.xEnd,
  overflowYStart: overflowEdges.value.yStart,
  overflowYEnd: overflowEdges.value.yEnd,
  cornerHidden: hiddenState.value.corner,
}))

const hideTrackUntilMeasured = computed(() => !hasMeasuredScrollbar.value && !props.keepMounted)

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0)
    return

  const target = getTarget(event) as Element | null
  const thumb = props.orientation === 'vertical' ? thumbYRef.value : thumbXRef.value

  if (thumb && contains(thumb, target))
    return
  if (!viewportRef.value)
    return

  if (thumbYRef.value && scrollbarYRef.value && props.orientation === 'vertical') {
    const thumbYOffset = getOffset(thumbYRef.value, 'margin', 'y')
    const scrollbarYOffset = getOffset(scrollbarYRef.value, 'padding', 'y')
    const thumbHeight = thumbYRef.value.offsetHeight
    const trackRectY = scrollbarYRef.value.getBoundingClientRect()
    const clickY = event.clientY - trackRectY.top - thumbHeight / 2 - scrollbarYOffset + thumbYOffset / 2
    const scrollableContentHeight = viewportRef.value.scrollHeight
    const viewportHeight = viewportRef.value.clientHeight
    const maxThumbOffsetY = scrollbarYRef.value.offsetHeight - thumbHeight - scrollbarYOffset - thumbYOffset
    const scrollRatioY = clickY / maxThumbOffsetY
    viewportRef.value.scrollTop = scrollRatioY * (scrollableContentHeight - viewportHeight)
  }

  if (thumbXRef.value && scrollbarXRef.value && props.orientation === 'horizontal') {
    const thumbXOffset = getOffset(thumbXRef.value, 'margin', 'x')
    const scrollbarXOffset = getOffset(scrollbarXRef.value, 'padding', 'x')
    const thumbWidth = thumbXRef.value.offsetWidth
    const trackRectX = scrollbarXRef.value.getBoundingClientRect()
    const clickX = event.clientX - trackRectX.left - thumbWidth / 2 - scrollbarXOffset + thumbXOffset / 2
    const scrollableContentWidth = viewportRef.value.scrollWidth
    const viewportWidth = viewportRef.value.clientWidth
    const maxThumbOffsetX = scrollbarXRef.value.offsetWidth - thumbWidth - scrollbarXOffset - thumbXOffset
    const scrollRatioX = clickX / maxThumbOffsetX

    let newScrollLeft: number
    if (direction.value === 'rtl') {
      newScrollLeft = (1 - scrollRatioX) * (scrollableContentWidth - viewportWidth)
      if (viewportRef.value.scrollLeft <= 0) {
        newScrollLeft = -newScrollLeft
      }
    }
    else {
      newScrollLeft = scrollRatioX * (scrollableContentWidth - viewportWidth)
    }
    viewportRef.value.scrollLeft = newScrollLeft
  }

  handlePointerDown(event)
}

const elementProps = computed(() => mergeProps(
  attrs as Record<string, any>,
  {
    ...(rootId ? { 'data-id': `${rootId}-scrollbar` } : {}),
    onPointerdown: onPointerDown,
    onPointerup: handlePointerUp,
    style: {
      position: 'absolute',
      touchAction: 'none',
      WebkitUserSelect: 'none',
      userSelect: 'none',
      visibility: hideTrackUntilMeasured.value ? 'hidden' : undefined,
      ...(props.orientation === 'vertical' && {
        top: 0,
        bottom: `var(${ScrollAreaRootCssVars.scrollAreaCornerHeight})`,
        insetInlineEnd: 0,
        [ScrollAreaScrollbarCssVars.scrollAreaThumbHeight]: `${thumbSize.value.height}px`,
      }),
      ...(props.orientation === 'horizontal' && {
        insetInlineStart: 0,
        insetInlineEnd: `var(${ScrollAreaRootCssVars.scrollAreaCornerWidth})`,
        bottom: 0,
        [ScrollAreaScrollbarCssVars.scrollAreaThumbWidth]: `${thumbSize.value.width}px`,
      }),
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
  ref: setScrollbarElement,
})

const isHidden = computed(() => props.orientation === 'vertical' ? hiddenState.value.y : hiddenState.value.x)
const shouldRender = computed(() => props.keepMounted || !isHidden.value)

const orientation = computed(() => props.orientation)

provide(scrollAreaScrollbarContextKey, { orientation })
</script>

<template>
  <template v-if="shouldRender">
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
</template>
