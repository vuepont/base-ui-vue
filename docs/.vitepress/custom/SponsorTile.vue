<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  alt?: string
  compact?: boolean
  href: string
  logo?: string
  name: string
}>(), {
  alt: undefined,
  compact: false,
  logo: undefined,
})

const isLogoTile = computed(() => Boolean(props.logo))
</script>

<template>
  <a
    :href="props.href"
    target="_blank"
    rel="noopener noreferrer"
    class="group flex h-full w-full items-center justify-center border border-black/5 bg-white px-6 py-6 transition-colors hover:border-black/10 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:hover:border-white/15 dark:hover:bg-zinc-900"
    :class="props.compact ? 'min-h-[88px]' : 'min-h-[140px]'"
  >
    <img
      v-if="isLogoTile"
      :src="props.logo"
      :alt="props.alt ?? props.name"
      class="h-auto w-full transition-transform duration-200 group-hover:scale-[1.02]"
      :class="props.compact ? 'max-w-[132px]' : 'max-w-[220px]'"
    >

    <span
      v-else
      class="block w-full text-center font-medium text-zinc-500 transition-colors group-hover:text-zinc-950 dark:text-zinc-400 dark:group-hover:text-zinc-50"
      :class="props.compact ? 'text-xs' : 'text-sm'"
    >
      <span class="block">{{ props.name }}</span>
    </span>
  </a>
</template>
