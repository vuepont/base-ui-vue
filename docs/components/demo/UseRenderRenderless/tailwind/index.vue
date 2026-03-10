<script setup lang="ts">
import { Slot, useRender } from 'base-ui-vue'
import { computed, defineComponent, h, mergeProps, ref } from 'vue'

const Counter = defineComponent({
  name: 'Counter',
  inheritAttrs: false,
  props: { as: { type: [String, Object], default: undefined } },
  setup(props, { attrs, slots }) {
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
      props: mergeProps(defaultProps, attrs),
    })

    return () => {
      if (element.renderless.value) {
        return slots.default?.({
          props: element.renderProps.value,
          state: element.state.value,
          ref: element.ref,
        })
      }
      return h(element.tag.value as any, element.renderProps.value, [
        'Counter: ',
        h('span', { class: 'tabular-nums inline-block text-end min-w-[2.5ch]' }, count.value),
        h('span', { class: 'ml-0.5' }, state.value.odd ? '👎' : '👍'),
      ])
    }
  },
})
</script>

<template>
  <Counter v-slot="data" :as="Slot">
    <button v-bind="data.props" :ref="data.ref">
      Counter: <span class="tabular-nums inline-block text-end min-w-[2.5ch]">{{ data.state.count }}</span>
      <span class="ml-0.5">{{ data.state.odd ? '👎' : '👍' }}</span>
    </button>
  </Counter>
</template>
