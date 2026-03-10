<script setup lang="ts">
import { mergeProps, useRender } from 'base-ui-vue'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ as?: any }>()

const { tag, renderProps } = useRender({
  defaultTagName: 'p',
  ...props,
  props: mergeProps({
    class: [
      'text-sm leading-5 text-gray-900',
      props.as === 'strong' ? 'font-medium' : '',
    ],
  }),
})
</script>

<template>
  <component :is="tag" v-bind="renderProps">
    <slot />
  </component>
</template>
