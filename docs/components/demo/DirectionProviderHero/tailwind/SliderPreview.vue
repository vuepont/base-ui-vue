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
  <div class="flex w-56 items-center py-3">
    <div class="relative h-1 w-full rounded-sm bg-gray-200 shadow-[inset_0_0_0_1px] shadow-gray-200">
      <div class="absolute inset-y-0 rounded-sm bg-gray-700" :style="indicatorStyle" />
      <div class="pointer-events-none absolute top-1/2 size-4 rounded-full bg-white outline-1 outline-gray-300" :style="thumbStyle" />
      <input
        class="absolute inset-x-0 -top-2 h-5 w-full cursor-pointer opacity-0"
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
