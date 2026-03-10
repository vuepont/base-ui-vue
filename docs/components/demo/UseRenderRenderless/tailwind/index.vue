<script setup lang="ts">
import { Slot } from 'base-ui-vue'
import Counter from './Counter.vue'
</script>

<template>
  <Counter v-slot="data" :as="Slot">
    <button v-bind="data.props" :ref="data.ref">
      Counter: <span class="tabular-nums inline-block text-end min-w-[2.5ch]">{{ data.state.count }}</span>
      <span class="ml-0.5">{{ data.state.odd ? '👎' : '👍' }}</span>
    </button>
  </Counter>
</template>
