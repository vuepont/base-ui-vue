<script setup lang="ts">
import { CheckboxGroup, CheckboxIndicator, CheckboxRoot } from 'base-ui-vue'
import { useId } from 'vue'

const labelId = useId()
const options = [
  { label: 'Fuji', value: 'fuji-apple' },
  { label: 'Gala', value: 'gala-apple' },
  { label: 'Granny Smith', value: 'granny-smith-apple' },
]
</script>

<template>
  <CheckboxGroup
    :aria-labelledby="labelId"
    :default-value="['fuji-apple']"
    class="CheckboxGroup"
  >
    <div :id="labelId" class="Caption">
      Apples
    </div>

    <label
      v-for="option in options"
      :key="option.value"
      class="Item"
    >
      <CheckboxRoot name="apple" :value="option.value" class="Checkbox">
        <CheckboxIndicator class="Indicator">
          <svg class="Icon" fill="currentColor" width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
            />
          </svg>
        </CheckboxIndicator>
      </CheckboxRoot>
      {{ option.label }}
    </label>
  </CheckboxGroup>
</template>

<style src="./styles.css"></style>
