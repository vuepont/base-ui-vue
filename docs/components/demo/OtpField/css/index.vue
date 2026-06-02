<script setup lang="ts">
import { OtpFieldInput, OtpFieldRoot } from 'base-ui-vue'
import { useId } from 'vue'

const OTP_LENGTH = 6
const id = useId()
const descriptionId = `${id}-description`
</script>

<template>
  <div class="Field">
    <label :for="id" class="Label">Verification code</label>
    <OtpFieldRoot
      :id="id"
      :length="OTP_LENGTH"
      :aria-describedby="descriptionId"
      class="Root"
    >
      <OtpFieldInput
        v-for="index in OTP_LENGTH"
        :key="index"
        class="Input"
        :aria-label="`Character ${index} of ${OTP_LENGTH}`"
      />
    </OtpFieldRoot>
    <p :id="descriptionId" class="Description">
      Enter the 6-character code we sent to your device.
    </p>
  </div>
</template>

<style scoped src="./styles.css"></style>
