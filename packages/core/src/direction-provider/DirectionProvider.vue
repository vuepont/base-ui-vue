<script lang="ts">
import type { TextDirection } from './DirectionContext'
</script>

<script setup lang="ts">
import { provide } from 'vue'
import { directionContextKey } from './DirectionContext'

export interface DirectionProviderProps {
  direction?: TextDirection
}

const props = withDefaults(defineProps<DirectionProviderProps>(), {
  direction: 'ltr',
})

provide(directionContextKey, props.direction)
</script>

<template>
  <slot />
</template>
