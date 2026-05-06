<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { BaseUIComponentProps } from '../../utils/types'
import { computed, shallowRef, useAttrs, watch } from 'vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { useRenderElement } from '../../utils/useRenderElement'
import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext'
import { useScrollAreaScrollbarContext } from '../scrollbar/ScrollAreaScrollbarContext'
import { ScrollAreaScrollbarCssVars } from '../scrollbar/ScrollAreaScrollbarCssVars'

export interface ScrollAreaThumbState {
  orientation?: 'horizontal' | 'vertical'
}

export interface ScrollAreaThumbProps extends BaseUIComponentProps<ScrollAreaThumbState> {}

defineOptions({
  name: 'ScrollAreaThumb',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ScrollAreaThumbProps>(), {
  as: 'div',
})

const attrs = useAttrs()

const {
  thumbYRef,
  thumbXRef,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  setScrollingX,
  setScrollingY,
  hasMeasuredScrollbar,
} = useScrollAreaRootContext()

const { orientation } = useScrollAreaScrollbarContext()
const thumbElementRef = shallowRef<HTMLDivElement | null>(null)

watch(
  [thumbElementRef, orientation],
  ([element, currentOrientation], [previousElement, previousOrientation]) => {
    if (previousElement) {
      const previousRef = previousOrientation === 'vertical' ? thumbYRef : thumbXRef

      if (previousRef.value === previousElement) {
        previousRef.value = null
      }
    }

    if (!element) {
      return
    }

    const nextRef = currentOrientation === 'vertical' ? thumbYRef : thumbXRef
    nextRef.value = element
  },
)

const state = computed<ScrollAreaThumbState>(() => ({
  orientation: orientation.value,
}))

function onPointerUp(event: PointerEvent) {
  if (orientation.value === 'vertical') {
    setScrollingY(false)
  }
  if (orientation.value === 'horizontal') {
    setScrollingX(false)
  }
  handlePointerUp(event)
}

function setThumbElement(element: Element | ComponentPublicInstance | null) {
  thumbElementRef.value = element as HTMLDivElement | null
}

const elementProps = computed(() => mergeProps(
  attrs,
  {
    onPointerdown: handlePointerDown,
    onPointermove: handlePointerMove,
    onPointerup: onPointerUp,
    style: {
      visibility: hasMeasuredScrollbar.value ? undefined : 'hidden',
      ...(orientation.value === 'vertical' && {
        height: `var(${ScrollAreaScrollbarCssVars.scrollAreaThumbHeight})`,
      }),
      ...(orientation.value === 'horizontal' && {
        width: `var(${ScrollAreaScrollbarCssVars.scrollAreaThumbWidth})`,
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
  defaultTagName: 'div',
  ref: setThumbElement,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component
    :is="tag"
    v-else
    :ref="renderRef"
    v-bind="mergedProps"
  />
</template>
