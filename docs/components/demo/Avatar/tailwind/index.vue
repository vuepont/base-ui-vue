<script setup lang="ts">
import { AvatarFallback, AvatarImage, AvatarRoot } from 'base-ui-vue'
</script>

<template>
  <div class="flex gap-5">
    <AvatarRoot
      class="inline-flex items-center justify-center align-middle rounded-full select-none font-medium text-gray-900 bg-gray-100 text-base leading-none overflow-hidden size-12"
    >
      <AvatarImage
        src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"
        class="object-cover h-full w-full"
      />
      <AvatarFallback class="flex items-center justify-center h-full w-full text-base">
        LT
      </AvatarFallback>
    </AvatarRoot>

    <AvatarRoot
      class="inline-flex items-center justify-center align-middle rounded-full select-none font-medium text-gray-900 bg-gray-100 text-base leading-none overflow-hidden size-12"
    >
      LT
    </AvatarRoot>
  </div>
</template>
