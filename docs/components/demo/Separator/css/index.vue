<script setup lang="ts">
import { Separator } from 'base-ui-vue'
</script>

<template>
  <div class="SeparatorDemo">
    <div class="Container">
      <a href="#" class="Link">
        Home
      </a>
      <a href="#" class="Link">
        Pricing
      </a>
      <a href="#" class="Link">
        Blog
      </a>
      <a href="#" class="Link">
        Support
      </a>

      <Separator orientation="vertical" class="Separator" />

      <a href="#" class="Link">
        Log in
      </a>
      <a href="#" class="Link">
        Sign up
      </a>
    </div>
  </div>
</template>

<style src="./styles.css"></style>
