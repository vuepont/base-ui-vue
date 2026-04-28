<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { ScrollAreaRootState } from '../root/ScrollAreaRootContext'
import { computed, onBeforeUnmount, onMounted, shallowRef, useAttrs } from 'vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { useRenderElement } from '../../utils/useRenderElement'
import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext'
import { scrollAreaStateAttributesMapping } from '../root/stateAttributes'
import { useScrollAreaViewportContext } from '../viewport/ScrollAreaViewportContext'

export type ScrollAreaContentState = ScrollAreaRootState

export interface ScrollAreaContentProps extends BaseUIComponentProps<ScrollAreaContentState> {}

defineOptions({
  name: 'ScrollAreaContent',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ScrollAreaContentProps>(), {
  as: 'div',
})

const attrs = useAttrs()

const contentWrapperRef = shallowRef<HTMLDivElement | null>(null)
const { computeThumbPosition } = useScrollAreaViewportContext()
const { viewportState } = useScrollAreaRootContext()

let resizeObserver: ResizeObserver | undefined

onMounted(() => {
  if (typeof ResizeObserver === 'undefined')
    return

  let hasInitialized = false
  resizeObserver = new ResizeObserver(() => {
    if (!hasInitialized) {
      hasInitialized = true
      return
    }
    computeThumbPosition()
  })

  if (contentWrapperRef.value) {
    resizeObserver.observe(contentWrapperRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

const elementProps = computed(() => mergeProps(
  attrs as Record<string, any>,
  {
    role: 'presentation',
    style: { minWidth: 'fit-content' },
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
  ref: contentWrapperRef,
})
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
