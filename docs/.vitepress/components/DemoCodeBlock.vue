<script setup lang="ts">
import type { VNode, VNodeArrayChildren } from 'vue'
import { CollapsiblePanel, CollapsibleRoot, CollapsibleTrigger } from 'base-ui-vue'
import { computed, ref, useSlots, watch } from 'vue'

const props = defineProps<{
  modelValue: 'css' | 'tailwind'
  name: string
  files?: string[]
  fileNames?: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: 'css' | 'tailwind']
}>()

const slots = useSlots()

const slotsFramework = computed(() =>
  ['css', 'tailwind'].filter(name => !!slots[name]) as ('css' | 'tailwind')[],
)

function flattenCodeNodes(nodes: VNode[] | undefined): VNode[] {
  if (!nodes?.length)
    return []

  return nodes.flatMap((node) => {
    const children = node.children
    if (Array.isArray(children)) {
      return children as VNodeArrayChildren as VNode[]
    }
    return [node]
  })
}

const cssFrameworkOptions = computed(() => [
  { label: 'CSS', value: 'css' },
  { label: 'Tailwind CSS', value: 'tailwind' },
].filter(i => slotsFramework.value.includes(i.value)))

const codeBlocks = computed(() => {
  const frameworkSlot = props.modelValue === 'tailwind' ? slots.tailwind : slots.css
  return flattenCodeNodes(frameworkSlot?.() as VNode[] | undefined)
})

const tabNames = computed(() => {
  if (props.fileNames && props.fileNames.length > 0)
    return props.fileNames
  return codeBlocks.value.map((_, i) => `${i}`)
})

const currentTab = ref('index.vue')

watch(() => props.modelValue, () => {
  currentTab.value = tabNames.value[0] ?? 'index.vue'
})

const sources = ref<Record<string, string>>({})

watch(() => [props.modelValue, props.files], () => {
  sources.value = {}
  props.files?.forEach((file) => {
    const parts = file.split('/')
    const fileName = parts.pop() ?? file
    const folder = parts[0]
    const extension = fileName.split('.').pop()
    import(`../../components/demo/${props.name}/${folder}/${fileName.replace(`.${extension}`, '')}.${extension}?raw`).then(
      res => (sources.value[fileName] = res.default),
    )
  })
}, { immediate: true })

const currentSource = computed(() => {
  return sources.value[currentTab.value] ?? ''
})

const open = ref(false)

const copySuccess = ref(false)

async function copyCode() {
  try {
    await navigator.clipboard.writeText(currentSource.value)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
  catch {
    const textarea = document.createElement('textarea')
    textarea.value = currentSource.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}

function onVariantChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as 'css' | 'tailwind'
  emit('update:modelValue', value)
}
</script>

<template>
  <CollapsibleRoot class="demo-code-root" :default-open="false" @open-change="(val) => open = val">
    <div v-show="open" class="demo-toolbar">
      <div class="demo-tabs">
        <button
          v-for="tabName in tabNames"
          :key="tabName"
          class="demo-tab"
          :data-active="currentTab === tabName ? '' : undefined"
          @click="currentTab = tabName"
        >
          {{ tabName }}
        </button>
      </div>

      <div class="demo-toolbar-actions">
        <div v-if="cssFrameworkOptions.length > 1" class="demo-variant-selector">
          <select
            :value="modelValue"
            aria-label="Styling method"
            @change="onVariantChange"
          >
            <option
              v-for="opt in cssFrameworkOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
          <svg class="demo-select-icon" width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>

        <button class="demo-action-btn" aria-label="Copy code" @click="copyCode">
          {{ copySuccess ? 'Copied' : 'Copy' }}
          <svg v-if="!copySuccess" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
    </div>

    <CollapsiblePanel keep-mounted>
      <div :key="modelValue" class="demo-code-viewport">
        <template v-for="(block, index) in codeBlocks" :key="index">
          <div v-show="currentTab === tabNames[index]" class="demo-source">
            <component :is="block" />
          </div>
        </template>
      </div>
    </CollapsiblePanel>

    <CollapsibleTrigger class="demo-toggle-btn">
      {{ open ? 'Hide code' : 'Show code' }}
    </CollapsibleTrigger>
  </CollapsibleRoot>
</template>

<style scoped>
.demo-code-root {
  border-top: 1px solid var(--vp-c-divider);
}

.demo-toolbar {
  font-size: 0.75rem;
  white-space: nowrap;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
  background-clip: padding-box;
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  gap: 2rem;
  height: 2.25rem;
  padding: 0;
  padding-left: 0.75rem;
  user-select: none;
  overflow: auto hidden;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.demo-toolbar::-webkit-scrollbar {
  display: none;
}

.demo-tabs {
  display: flex;
  gap: 1rem;
}

.demo-tab {
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  letter-spacing: normal;
  cursor: default;
  position: relative;
  z-index: 0;
  background: none;
  border: none;
  color: var(--vp-c-text-2);
  padding: 0;
  line-height: 2.25rem;
}

.demo-tab::before {
  content: '';
  position: absolute;
  inset: 0.125rem -0.375rem;
  border-radius: 4px;
  z-index: -1;
}

@media (hover: hover) {
  .demo-tab:hover::before {
    background-color: var(--vp-c-default-soft);
  }
}

.demo-tab[data-active] {
  color: var(--vp-c-text-1);
  font-weight: bold;
}

.demo-tab[data-active]::before {
  background-color: var(--vp-c-bg);
  outline: 1px solid var(--vp-c-divider);
  outline-offset: -1px;
  box-shadow: 0 2px 3px -2px var(--vp-c-divider);
}

.demo-toolbar-actions {
  position: relative;
  right: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  padding-right: 0.75rem;
  padding-left: 1rem;
  background-color: var(--vp-c-bg-soft);
  height: 100%;
}

@media (min-width: 768px) {
  .demo-toolbar-actions {
    position: sticky;
  }
}

.demo-toolbar-actions::before {
  content: '';
  position: absolute;
  top: 0;
  left: -24px;
  width: 24px;
  height: 100%;
  background: linear-gradient(to right, transparent, var(--vp-c-bg-soft));
  pointer-events: none;
}

.demo-variant-selector {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.demo-variant-selector select {
  appearance: none;
  background: none;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  padding: 0.25rem 1.5rem 0.25rem 0.5rem;
  cursor: default;
  font-family: inherit;
  line-height: 1.25rem;
}

.demo-variant-selector select:hover {
  border-color: var(--vp-c-text-3);
}

.demo-select-icon {
  position: absolute;
  right: 0.4rem;
  pointer-events: none;
  color: var(--vp-c-text-3);
}

.demo-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: none;
  border: none;
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  cursor: default;
  padding: 0.25rem 0;
  font-family: inherit;
  white-space: nowrap;
}

@media (hover: hover) {
  .demo-action-btn:hover {
    color: var(--vp-c-text-1);
  }
}

.demo-code-viewport {
  overflow: auto;
  max-height: 60vh;
}

.demo-source :deep(div[class*="language-"]) {
  margin: 0 !important;
  border-radius: 0 !important;
  border: none !important;
}

.demo-source :deep(pre) {
  margin: 0 !important;
  border-radius: 0 !important;
}

.demo-source :deep(.shiki) {
  padding: 0.5rem 0;
}

.demo-source :deep(button.copy) {
  display: none;
}

.demo-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 2.5rem;
  background: none;
  border: none;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  font-family: inherit;
  cursor: default;
  user-select: none;
  position: sticky;
  bottom: 0;
  background-color: var(--vp-c-bg-soft);
  z-index: 1;
}

@media (hover: hover) {
  .demo-toggle-btn:hover {
    color: var(--vp-c-text-1);
    background-color: var(--vp-c-default-soft);
  }
}
</style>
