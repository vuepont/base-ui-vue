<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import { computed, useAttrs } from 'vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { useRenderElement } from '../../utils/useRenderElement'
import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext'

export interface ScrollAreaCornerState {}

export interface ScrollAreaCornerProps extends BaseUIComponentProps<ScrollAreaCornerState> {}

defineOptions({
  name: 'ScrollAreaCorner',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ScrollAreaCornerProps>(), {
  as: 'div',
})

const attrs = useAttrs()

const { cornerRef, cornerSize, hiddenState } = useScrollAreaRootContext()

const state = computed<ScrollAreaCornerState>(() => ({}))

const elementProps = computed(() => mergeProps(
  attrs as Record<string, any>,
  {
    style: {
      position: 'absolute',
      bottom: 0,
      insetInlineEnd: 0,
      width: cornerSize.value.width,
      height: cornerSize.value.height,
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
  ref: cornerRef,
})
</script>

<template>
  <template v-if="!hiddenState.corner">
    <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
    <component
      :is="tag"
      v-else
      :ref="renderRef"
      v-bind="mergedProps"
    />
  </template>
</template>
