<script lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { Dimensions, ModifierKey } from '../composite'
</script>

<script setup lang="ts">
import { computed, provide, reactive, useAttrs } from 'vue'
import CompositeList from '../list/CompositeList.vue'
import { compositeRootContextKey } from './CompositeRootContext'
import { useCompositeRoot } from './useCompositeRoot'

export interface CompositeRootProps extends BaseUIComponentProps<any> {
  orientation?: 'horizontal' | 'vertical' | 'both'
  cols?: number
  loopFocus?: boolean
  highlightedIndex?: number
  defaultHighlightedIndex?: number
  itemSizes?: Dimensions[]
  dense?: boolean
  enableHomeAndEndKeys?: boolean
  stopEventPropagation?: boolean
  disabledIndices?: number[]
  modifierKeys?: ModifierKey[]
  highlightItemOnHover?: boolean
}

export interface CompositeRootEmits {
  (e: 'update:highlightedIndex', index: number): void
}

defineOptions({
  name: 'BaseUICompositeRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CompositeRootProps>(), {
  as: 'div',
  orientation: 'both',
  cols: 1,
  loopFocus: true,
  dense: false,
  enableHomeAndEndKeys: false,
  stopEventPropagation: true,
  highlightItemOnHover: false,
})

const emit = defineEmits<CompositeRootEmits>()
const attrs = useAttrs()

const root = useCompositeRoot({
  orientation: () => props.orientation,
  cols: () => props.cols,
  loopFocus: () => props.loopFocus,
  highlightedIndex: () => props.highlightedIndex,
  defaultHighlightedIndex: () => props.defaultHighlightedIndex,
  onHighlightedIndexChange: (index) => {
    emit('update:highlightedIndex', index)
  },
  dense: () => props.dense,
  itemSizes: () => props.itemSizes,
  enableHomeAndEndKeys: () => props.enableHomeAndEndKeys,
  stopEventPropagation: () => props.stopEventPropagation,
  disabledIndices: () => props.disabledIndices,
  modifierKeys: () => props.modifierKeys,
})

provide(
  compositeRootContextKey,
  reactive({
    highlightedIndex: root.highlightedIndex,
    onHighlightedIndexChange: root.onHighlightedIndexChange,
    highlightItemOnHover: computed(() => props.highlightItemOnHover),
    relayKeyboardEvent: root.relayKeyboardEvent,
  }),
)

function setRootRef(el: any) {
  root.rootRef.value = el?.$el || el
}
</script>

<template>
  <CompositeList :elements-ref="root.elementsRef" @map-change="root.onMapChange">
    <component
      :is="props.as" :ref="setRootRef" v-bind="root.getRootProps(attrs)"
      :class="typeof props.class === 'function' ? props.class({}) : props.class"
      :style="typeof props.style === 'function' ? props.style({}) : props.style"
    >
      <slot />
    </component>
  </CompositeList>
</template>
