<script setup lang="ts">
import { mergeProps, useRender } from 'base-ui-vue'
import { computed, ref } from 'vue'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ as?: any }>()

const count = ref(0)
const odd = computed(() => count.value % 2 === 1)
const state = computed(() => ({ odd: odd.value, count: count.value }))

const defaultProps = {
  'class': 'inline-flex items-center justify-center h-10 px-3.5 m-0 outline-none border border-gray-200 rounded-md bg-gray-50 font-inherit text-base font-medium leading-6 text-gray-900 select-none cursor-pointer hover:bg-gray-100 active:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:-outline-offset-1',
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
    Counter: <span class="tabular-nums inline-block text-end min-w-[2.5ch]">{{ count }}</span>
    <span class="ml-0.5">{{ state.odd ? '👎' : '👍' }}</span>
  </component>
</template>
