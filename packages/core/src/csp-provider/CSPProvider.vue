<script setup lang="ts">
import type { CSPContextValue } from './CSPContext'
import { computed, provide } from 'vue'
import { cspContextKey } from './CSPContext'

export interface CSPProviderProps {
  /**
   * The nonce value to apply to inline `<style>` and `<script>` tags.
   */
  nonce?: string
  /**
   * Whether inline `<style>` elements created by Base UI components should not be rendered.
   * @default false
   */
  disableStyleElements?: boolean
}

/**
 * Provides a default Content Security Policy (CSP) configuration for Base UI Vue components
 * that require inline `<style>` or `<script>` tags.
 */
defineOptions({
  name: 'CSPProvider',
})

const props = withDefaults(defineProps<CSPProviderProps>(), {
  disableStyleElements: false,
})

const contextValue = computed<CSPContextValue>(() => ({
  nonce: props.nonce,
  disableStyleElements: props.disableStyleElements,
}))

provide(cspContextKey, contextValue.value)
</script>

<template>
  <slot />
</template>
