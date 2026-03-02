<script setup lang="ts">
import { AvatarFallback, AvatarImage, AvatarRoot } from 'base-ui-vue'
import './styles.css'
</script>

<template>
  <div style="display: flex; gap: 20px;">
    <AvatarRoot class="AvatarRoot">
      <AvatarImage
        src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"
        class="AvatarImage"
      />
      <AvatarFallback class="AvatarFallback">
        LT
      </AvatarFallback>
    </AvatarRoot>

    <AvatarRoot class="AvatarRoot">
      LT
    </AvatarRoot>
  </div>
</template>
