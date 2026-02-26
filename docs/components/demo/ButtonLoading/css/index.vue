<script setup lang="ts">
import { Button } from 'base-ui-vue'
import { ref } from 'vue'
import './styles.css'

const loading = ref(false)

function handleClick() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 4000)
}
</script>

<template>
  <Button
    class="Button"
    :disabled="loading"
    focusable-when-disabled
    @click="handleClick"
  >
    {{ loading ? 'Submitting' : 'Submit' }}
  </Button>
</template>
