<script setup lang="ts">
import { mergeProps, useRender } from 'base-ui-vue'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ as?: any }>()

const element = useRender({
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
  <component :is="element.tag" v-bind="element.renderProps">
    <slot />
  </component>
</template>
