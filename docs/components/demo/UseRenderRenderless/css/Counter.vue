<script setup lang="ts">
import { mergeProps, useRender } from 'base-ui-vue'
import { computed, ref } from 'vue'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ as?: any }>()

const count = ref(0)
const odd = computed(() => count.value % 2 === 1)
const state = computed(() => ({ odd: odd.value, count: count.value }))

const defaultProps = {
  'class': 'Button',
  'type': 'button',
  onClick() {
    count.value += 1
  },
  'aria-label': computed(() => `Count is ${count.value}, click to increase.`),
}

const element = useRender({
  defaultTagName: 'button',
  ...props,
  state,
  props: mergeProps(defaultProps),
})
</script>

<template>
  <slot v-if="element.renderless" :ref="element.ref" :props="element.renderProps" :state="element.state" />
  <component :is="element.tag" v-else v-bind="element.renderProps" :ref="element.ref">
    Counter: <span class="number">{{ count }}</span>
    <span class="suffix">{{ state.odd ? '👎' : '👍' }}</span>
  </component>
</template>
