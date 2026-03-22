<script setup lang="ts">
import type { DirectionProviderProps } from './DirectionContext'
import { provide, toRef } from 'vue'
import {
  directionContextKey,

} from './DirectionContext'

/**
 * Enables RTL behavior for Base UI Vue components.
 *
 * Documentation: [Base UI Vue Direction Provider](https://base-ui-vue.com/utils/direction-provider)
 */
defineOptions({
  name: 'DirectionProvider',
})

const props = withDefaults(defineProps<DirectionProviderProps>(), {
  direction: 'ltr',
})

const contextValue = {
  direction: toRef(props, 'direction'),
}

provide(directionContextKey, contextValue)
</script>

<template>
  <slot />
</template>
