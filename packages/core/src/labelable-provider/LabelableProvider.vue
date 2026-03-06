<script setup lang="ts">
import type { LabelableContext } from './LabelableContext'
import { computed, provide, ref } from 'vue'
import { labelableContextKey, useLabelableContext } from './LabelableContext'

export interface LabelableProviderProps {
  controlId?: string | null
  labelId?: string
}

defineOptions({ name: 'LabelableProvider' })

const props = defineProps<LabelableProviderProps>()

const controlId = ref<string | null | undefined>(props.controlId)
const labelId = ref<string | undefined>(props.labelId)
const messageIds = ref<string[]>([])

const parent = useLabelableContext()

function setControlId(id: string | null | undefined) {
  controlId.value = id
}

function setLabelId(id: string | undefined) {
  labelId.value = id
}

function setMessageIds(updater: (ids: string[]) => string[]) {
  messageIds.value = updater(messageIds.value)
}

const getDescriptionProps = computed(() => {
  return () => {
    const parentIds = parent.messageIds.value
    const allIds = parentIds.concat(messageIds.value)
    const describedBy = allIds.join(' ') || undefined
    return { 'aria-describedby': describedBy }
  }
}).value

const contextValue: LabelableContext = {
  controlId,
  setControlId,
  labelId,
  setLabelId,
  messageIds,
  setMessageIds,
  getDescriptionProps,
}

provide(labelableContextKey, contextValue)
</script>

<template>
  <slot />
</template>
