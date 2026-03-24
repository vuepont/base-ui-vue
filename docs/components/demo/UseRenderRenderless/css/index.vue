<script setup lang="ts">
import { Slot } from 'base-ui-vue'
import Counter from './Counter.vue'
</script>

<template>
  <Counter v-slot="data" :as="Slot">
    <button v-bind="data.props" :ref="data.ref">
      Counter: <span class="number">{{ data.state.count }}</span>
      <span class="suffix">{{ data.state.odd ? '👎' : '👍' }}</span>
    </button>
  </Counter>
</template>

<style scoped src="./styles.css"></style>
