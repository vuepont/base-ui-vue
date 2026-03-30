<script setup lang="ts">
import { CheckboxGroup, CheckboxIndicator, CheckboxRoot } from 'base-ui-vue'
import { ref, useId } from 'vue'

const labelId = useId()
const fruits = ['fuji-apple', 'gala-apple', 'granny-smith-apple']
const value = ref<string[]>([])

function handleValueChange(nextValue: string[]) {
  value.value = nextValue
}
</script>

<template>
  <CheckboxGroup
    :aria-labelledby="labelId"
    :all-values="fruits"
    :value="value"
    class="CheckboxGroup"
    @value-change="handleValueChange"
  >
    <label :id="labelId" class="Item ParentItem">
      <CheckboxRoot parent class="Checkbox">
        <CheckboxIndicator class="Indicator">
          <svg
            v-if="value.length > 0 && value.length !== fruits.length"
            class="Icon"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </svg>
          <svg
            v-else
            class="Icon"
            fill="currentColor"
            width="10"
            height="10"
            viewBox="0 0 10 10"
          >
            <path
              d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
            />
          </svg>
        </CheckboxIndicator>
      </CheckboxRoot>
      Apples
    </label>

    <label class="Item">
      <CheckboxRoot value="fuji-apple" class="Checkbox">
        <CheckboxIndicator class="Indicator">
          <svg class="Icon" fill="currentColor" width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
            />
          </svg>
        </CheckboxIndicator>
      </CheckboxRoot>
      Fuji
    </label>

    <label class="Item">
      <CheckboxRoot value="gala-apple" class="Checkbox">
        <CheckboxIndicator class="Indicator">
          <svg class="Icon" fill="currentColor" width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
            />
          </svg>
        </CheckboxIndicator>
      </CheckboxRoot>
      Gala
    </label>

    <label class="Item">
      <CheckboxRoot value="granny-smith-apple" class="Checkbox">
        <CheckboxIndicator class="Indicator">
          <svg class="Icon" fill="currentColor" width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z"
            />
          </svg>
        </CheckboxIndicator>
      </CheckboxRoot>
      Granny Smith
    </label>
  </CheckboxGroup>
</template>

<style src="./styles.css"></style>
