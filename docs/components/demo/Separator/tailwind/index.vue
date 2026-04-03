<script setup lang="ts">
import { Separator } from 'base-ui-vue'
</script>

<template>
  <div class="SeparatorDemo flex gap-4 text-nowrap">
    <a
      href="#"
      class="text-sm outline-hidden focus-visible:rounded-xs focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-blue-800"
    >
      Home
    </a>
    <a
      href="#"
      class="text-sm outline-hidden focus-visible:rounded-xs focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-blue-800"
    >
      Pricing
    </a>
    <a
      href="#"
      class="text-sm outline-hidden focus-visible:rounded-xs focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-blue-800"
    >
      Blog
    </a>
    <a
      href="#"
      class="text-sm outline-hidden focus-visible:rounded-xs focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-blue-800"
    >
      Support
    </a>

    <Separator orientation="vertical" class="w-px bg-gray-300" />

    <a
      href="#"
      class="text-sm outline-hidden focus-visible:rounded-xs focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-blue-800"
    >
      Log in
    </a>
    <a
      href="#"
      class="text-sm outline-hidden focus-visible:rounded-xs focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-blue-800"
    >
      Sign up
    </a>
  </div>
</template>

<style>
.SeparatorDemo a {
  color: var(--color-gray-900);
  text-decoration-line: none;
  text-decoration-color: var(--color-gray-400);
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

@media (hover: hover) {
  .SeparatorDemo a:hover {
    color: var(--color-gray-900);
    text-decoration-line: underline;
  }
}
</style>
