<script setup lang="ts">
import { mergeProps, useRender } from 'base-ui-vue'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ as?: any }>()

const { tag, renderProps } = useRender({
  defaultTagName: 'p',
  ...props,
  props: mergeProps({ class: 'Text' }),
})
</script>

<template>
  <component :is="tag" v-bind="renderProps">
    <slot />
  </component>
</template>
