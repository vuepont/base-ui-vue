<script setup lang="ts">
import { useDirection } from 'base-ui-vue'
import { computed, ref } from 'vue'

const direction = useDirection()
const value = ref(25)

const indicatorStyle = computed(() => ({
  width: `${value.value}%`,
  insetInlineStart: '0',
}))

const thumbStyle = computed(() => ({
  insetInlineStart: `${value.value}%`,
  transform: `translate(${direction.value === 'rtl' ? '50%' : '-50%'}, -50%)`,
}))

function onInput(event: Event) {
  value.value = Number((event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="Control">
    <div class="Track">
      <div class="Indicator" :style="indicatorStyle" />
      <div class="Thumb" :style="thumbStyle" />
      <input
        class="Input"
        type="range"
        min="0"
        max="100"
        :value="value"
        aria-label="Value"
        :dir="direction"
        @input="onInput"
      >
    </div>
  </div>
</template>
