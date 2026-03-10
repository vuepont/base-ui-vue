<script setup lang="ts">
import CustomText from './CustomText.vue'
</script>

<template>
  <div class="flex flex-col gap-2">
    <CustomText>Text component rendered as a paragraph tag</CustomText>
    <CustomText as="strong">
      Text component rendered as a strong tag
    </CustomText>
  </div>
</template>
