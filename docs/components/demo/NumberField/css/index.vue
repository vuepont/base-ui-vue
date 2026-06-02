<script setup lang="ts">
import {
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
} from 'base-ui-vue'

const id = 'number-field-amount-css'
</script>

<template>
  <NumberFieldRoot :id="id" :default-value="100" class="Field">
    <NumberFieldScrubArea class="ScrubArea">
      <label :for="id" class="Label">
        Amount
      </label>
      <NumberFieldScrubAreaCursor class="ScrubAreaCursor">
        <svg
          width="26"
          height="14"
          viewBox="0 0 24 14"
          fill="black"
          stroke="white"
          style="display: block"
        >
          <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
        </svg>
      </NumberFieldScrubAreaCursor>
    </NumberFieldScrubArea>

    <NumberFieldGroup class="Group">
      <NumberFieldDecrement class="Decrement">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-linecap="square"
          stroke-linejoin="round"
          style="display: block"
        >
          <path d="M1.5 8h13" />
        </svg>
      </NumberFieldDecrement>
      <NumberFieldInput class="Input" />
      <NumberFieldIncrement class="Increment">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-linecap="square"
          stroke-linejoin="round"
          style="display: block"
        >
          <path d="M1.5 8h13M8 14.5v-13" />
        </svg>
      </NumberFieldIncrement>
    </NumberFieldGroup>
  </NumberFieldRoot>
</template>

<style scoped src="./styles.css"></style>
