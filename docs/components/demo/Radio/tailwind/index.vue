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
  <RadioGroup
    :aria-labelledby="labelId"
    default-value="fuji-apple"
    class="flex flex-col items-start gap-1 text-neutral-950 dark:text-white"
  >
    <div :id="labelId" class="text-sm font-bold">
      Best apple
    </div>

    <label
      v-for="option in options"
      :key="option.value"
      class="flex items-center gap-2 text-sm font-normal text-neutral-950 dark:text-white"
    >
      <RadioRoot
        :value="option.value"
        class="flex size-4 shrink-0 items-center justify-center rounded-full border border-neutral-950 bg-white p-0 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 data-[checked]:bg-neutral-950 data-[checked]:text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 dark:data-[checked]:bg-white dark:data-[checked]:text-neutral-950 dark:focus-visible:outline-white"
      >
        <RadioIndicator class="flex items-center justify-center before:size-2 before:rounded-full before:bg-current data-[unchecked]:hidden" />
      </RadioRoot>
      {{ option.label }}
    </label>
  </RadioGroup>
</template>
