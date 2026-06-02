<script setup lang="ts">
import { OtpFieldInput, OtpFieldRoot } from 'base-ui-vue'
import { useId } from 'vue'

const OTP_LENGTH = 6
const id = useId()
const descriptionId = `${id}-description`
</script>

<template>
  <div class="flex w-full max-w-80 flex-col items-start gap-1">
    <label :for="id" class="text-sm font-bold text-neutral-950 dark:text-white">
      Verification code
    </label>
    <OtpFieldRoot
      :id="id"
      :length="OTP_LENGTH"
      :aria-describedby="descriptionId"
      class="flex w-full gap-2"
    >
      <OtpFieldInput
        v-for="index in OTP_LENGTH"
        :key="index"
        class="m-0 h-10 w-10 rounded-none border border-neutral-950 bg-white text-center font-[inherit] text-base font-normal text-neutral-950 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:focus:outline-white"
        :aria-label="`Character ${index} of ${OTP_LENGTH}`"
      />
    </OtpFieldRoot>
    <p :id="descriptionId" class="m-0 text-sm text-neutral-600 dark:text-neutral-400">
      Enter the 6-character code we sent to your device.
    </p>
  </div>
</template>
