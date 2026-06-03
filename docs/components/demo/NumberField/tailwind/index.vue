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

const id = 'number-field-amount-tailwind'
const stepperClasses
  = 'flex h-full w-8 items-center justify-center border border-gray-900 bg-white bg-clip-padding text-gray-900 outline-0 select-none hover:not-data-disabled:bg-gray-100 active:not-data-disabled:bg-gray-200 data-disabled:border-gray-500 data-disabled:text-gray-500'
</script>

<template>
  <NumberFieldRoot :id="id" :default-value="100" class="flex flex-col items-start gap-1">
    <NumberFieldScrubArea class="cursor-ew-resize font-bold select-none">
      <label :for="id" class="cursor-ew-resize text-sm font-bold text-gray-900">
        Amount
      </label>
      <NumberFieldScrubAreaCursor class="drop-shadow-[0_1px_1px_#0008] filter">
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

    <NumberFieldGroup class="flex h-8">
      <NumberFieldDecrement :class="`${stepperClasses} border-r-0`">
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
      <NumberFieldInput class="h-full w-[7ch] border border-gray-900 bg-white px-2 text-left text-sm font-normal text-gray-900 tabular-nums focus:z-1 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-900" />
      <NumberFieldIncrement :class="`${stepperClasses} border-l-0`">
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
