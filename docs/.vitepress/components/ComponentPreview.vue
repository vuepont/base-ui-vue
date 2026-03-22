<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { computed, watch } from 'vue'
import DemoCodeBlock from './DemoCodeBlock.vue'

const props = withDefaults(defineProps<{
  name: string
  files?: string
}>(), {})

const cssFramework = useStorage<'css' | 'tailwind'>('cssFramework', 'tailwind')

const allFiles = computed(() => {
  if (!props.files)
    return {}
  return JSON.parse(decodeURIComponent(props.files))
})

const availableFrameworks = computed(() =>
  (['css', 'tailwind'] as const).filter(framework => framework in allFiles.value),
)

watch(availableFrameworks, (frameworks) => {
  if (!frameworks.length)
    return
  if (!frameworks.includes(cssFramework.value))
    cssFramework.value = frameworks[0]
}, { immediate: true })

const currentFramework = computed(() => {
  if (availableFrameworks.value.includes(cssFramework.value))
    return cssFramework.value

  return availableFrameworks.value[0] ?? 'css'
})

const currentFiles = computed(() => allFiles.value[currentFramework.value] ?? [])

const fileNames = computed(() =>
  currentFiles.value.map((f: string) => f.split('/').pop() ?? f),
)
</script>

<template>
  <div class="demo-root">
    <div class="demo-playground">
      <div class="demo-playground-inner">
        <slot v-if="currentFramework === 'tailwind'" name="demo-tailwind" />
        <slot v-else name="demo-css" />
      </div>
    </div>

    <DemoCodeBlock
      v-model="cssFramework"
      :name="name"
      :files="currentFiles"
      :file-names="fileNames"
    >
      <template v-if="availableFrameworks.includes('tailwind')" #tailwind>
        <slot name="tailwind" />
      </template>
      <template v-if="availableFrameworks.includes('css')" #css>
        <slot name="css" />
      </template>
    </DemoCodeBlock>
  </div>
</template>

<style scoped>
.demo-root {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
  background-color: var(--vp-c-bg);
}

.demo-playground {
  overflow: auto hidden;
  overscroll-behavior-x: contain;
  background-color: var(--vp-c-bg);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.demo-playground:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: -1px;
  z-index: 1;
}

.demo-playground-inner {
  padding: 2rem 1.5rem;
  min-height: 8rem;
  min-width: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (min-width: 640px) {
  .demo-playground-inner {
    padding: 3rem 1.5rem;
    min-height: 11.25rem;
  }
}
</style>
