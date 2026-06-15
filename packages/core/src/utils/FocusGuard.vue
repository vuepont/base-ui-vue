<script setup lang="ts">
import { onMounted, shallowRef, useAttrs } from 'vue'
import { platform } from './platform'
import { visuallyHidden } from './visuallyHidden'

defineOptions({
  name: 'FocusGuard',
  inheritAttrs: false,
})

const attrs = useAttrs()
const element = shallowRef<HTMLSpanElement | null>(null)
const role = shallowRef<'button' | undefined>(undefined)

onMounted(() => {
  if (platform.screenReader.voiceOver && platform.engine.webkit) {
    role.value = 'button'
  }
})

defineExpose({
  element,
})
</script>

<template>
  <span
    ref="element"
    v-bind="attrs"
    :style="visuallyHidden"
    :tabindex="0"
    :role="role"
    :aria-hidden="role ? undefined : 'true'"
    data-base-ui-vue-focus-guard=""
  />
</template>
