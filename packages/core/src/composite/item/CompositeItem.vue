<script lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
</script>

<script setup lang="ts" generic="Metadata">
import { useAttrs } from 'vue'
import { useCompositeItem } from './useCompositeItem'

export interface CompositeItemProps<Metadata> extends BaseUIComponentProps<any> {
  metadata?: Metadata
}

defineOptions({
  name: 'BaseUICompositeItem',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CompositeItemProps<Metadata>>(), {
  as: 'div',
})

const attrs = useAttrs()

const { getCompositeProps, compositeRef } = useCompositeItem({
  metadata: () => props.metadata,
})
</script>

<template>
  <component
    :is="props.as" :ref="compositeRef" v-bind="getCompositeProps(attrs)"
    :class="typeof props.class === 'function' ? props.class({}) : props.class"
    :style="typeof props.style === 'function' ? props.style({}) : props.style"
  >
    <slot />
  </component>
</template>
