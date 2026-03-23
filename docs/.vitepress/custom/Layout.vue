<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { computed } from 'vue'
import HomePage from './HomePage.vue'

const { page } = useData()

const isHomePage = computed(() => page.value.relativePath === 'index.md')
</script>

<template>
  <HomePage v-if="isHomePage" />
  <DefaultTheme.Layout v-else />
</template>
