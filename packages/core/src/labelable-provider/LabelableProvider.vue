<script setup lang="ts">
import type { LabelableContext } from './LabelableContext'
import { provide, ref } from 'vue'
import { useBaseUiId } from '../utils/useBaseUiId'
import { labelableContextKey, useLabelableContext } from './LabelableContext'

export interface LabelableProviderProps {
  controlId?: string | null
  labelId?: string
}

defineOptions({ name: 'LabelableProvider' })

const props = defineProps<LabelableProviderProps>()

const defaultId = useBaseUiId()
const initialControlId = props.controlId === undefined ? defaultId : props.controlId

const controlId = ref<string | null | undefined>(initialControlId)
const labelId = ref<string | undefined>(props.labelId)
const messageIds = ref<string[]>([])
const registrations = new Map<symbol, string | null | undefined>()

const parent = useLabelableContext()

function registerControlId(source: symbol, id: string | null | undefined) {
  if (id === undefined) {
    registrations.delete(source)
  }
  else {
    registrations.set(source, id)
  }

  if (registrations.size === 0) {
    controlId.value = initialControlId
    return
  }

  controlId.value = registrations.values().next().value
}

function setLabelId(id: string | undefined) {
  labelId.value = id
}

function setMessageIds(updater: (ids: string[]) => string[]) {
  messageIds.value = updater(messageIds.value)
}

function getDescriptionProps() {
  const parentIds = parent.messageIds.value
  const allIds = parentIds.concat(messageIds.value)
  const describedBy = allIds.join(' ') || undefined
  return { 'aria-describedby': describedBy }
}

const contextValue: LabelableContext = {
  controlId,
  registerControlId,
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
