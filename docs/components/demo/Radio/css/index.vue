<script setup lang="ts">
import { RadioGroup, RadioIndicator, RadioRoot } from 'base-ui-vue'
import { useId } from 'vue'

const options = [
  { value: 'fuji-apple', label: 'Fuji' },
  { value: 'gala-apple', label: 'Gala' },
  { value: 'granny-smith-apple', label: 'Granny Smith' },
]

const labelId = useId()
</script>

<template>
  <RadioGroup :aria-labelledby="labelId" default-value="fuji-apple" class="RadioGroup">
    <div :id="labelId" class="Caption">
      Best apple
    </div>

    <label v-for="option in options" :key="option.value" class="Item">
      <RadioRoot :value="option.value" class="Radio">
        <RadioIndicator class="Indicator" />
      </RadioRoot>
      {{ option.label }}
    </label>
  </RadioGroup>
</template>

<style src="./styles.css"></style>
