<script setup lang="ts">
import { mergeProps, useRender } from 'base-ui-vue'
import { computed, ref } from 'vue'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ as?: any }>()

const count = ref(0)
const odd = computed(() => count.value % 2 === 1)
const state = computed(() => ({ odd: odd.value, count: count.value }))

const defaultProps = {
  class: 'Button',
  type: 'button',
  onClick() {
    count.value += 1
  },
}

const { tag, renderProps, renderless, state: elementState, ref: elementRef } = useRender({
  defaultTagName: 'button',
  ...props,
  state,
  props: computed(() =>
    mergeProps(defaultProps, {
      'aria-label': `Count is ${count.value}, click to increase.`,
    }),
  ),
})
</script>

<template>
  <slot v-if="renderless" :ref="elementRef" :props="renderProps" :state="elementState" />
  <component :is="tag" v-else v-bind="renderProps" :ref="elementRef">
    Counter: <span class="number">{{ count }}</span>
    <span class="suffix">{{ elementState.odd ? '👎' : '👍' }}</span>
  </component>
</template>
