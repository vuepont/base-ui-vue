<script setup lang="ts">
import { Slot, useRender } from 'base-ui-vue'
import { computed, defineComponent, h, mergeProps, ref } from 'vue'
import './styles.css'

const Counter = defineComponent({
  name: 'Counter',
  inheritAttrs: false,
  props: { as: { type: [String, Object], default: undefined } },
  setup(props, { attrs, slots }) {
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
        h('span', { class: 'number' }, count.value),
        h('span', { class: 'suffix' }, state.value.odd ? '👎' : '👍'),
      ])
    }
  },
})
</script>

<template>
  <Counter v-slot="data" :as="Slot">
    <button v-bind="data.props" :ref="data.ref">
      Counter: <span class="number">{{ data.state.count }}</span>
      <span class="suffix">{{ data.state.odd ? '👎' : '👍' }}</span>
    </button>
  </Counter>
</template>
