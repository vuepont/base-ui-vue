<script setup lang="ts">
import { sponsors, sponsorsCta } from '../meta'
</script>

<template>
  <section
    v-if="sponsors.length"
    class="space-y-8"
    aria-labelledby="home-sponsors"
  >
    <h2
      id="home-sponsors"
      class="text-xs font-bold tracking-[0.3em] text-zinc-500 uppercase dark:text-zinc-400"
    >
      Sponsors
    </h2>

    <div class="flex flex-wrap items-center gap-x-12 gap-y-8 opacity-40 grayscale transition-opacity hover:opacity-60 dark:opacity-80 dark:grayscale-0 dark:hover:opacity-100">
      <a
        v-for="sponsor in sponsors"
        :key="sponsor.name"
        :href="sponsor.href"
        target="_blank"
        rel="noopener noreferrer"
        class="transition-transform duration-200 hover:scale-[1.02] dark:rounded-sm dark:bg-white dark:px-3 dark:py-2"
      >
        <img
          :src="sponsor.logo"
          :alt="sponsor.alt"
          class="h-5 w-auto md:h-6"
        >
      </a>
    </div>

    <div>
      <a
        :href="sponsorsCta.href"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center text-sm font-medium decoration-1 underline-offset-4 transition hover:underline"
      >
        {{ sponsorsCta.name }}
        <svg viewBox="0 0 20 20" fill="currentColor" class="ml-1 size-4">
          <path
            fill-rule="evenodd"
            d="M3.5 10a.75.75 0 0 1 .75-.75h9.69L10.72 6.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H4.25A.75.75 0 0 1 3.5 10Z"
            clip-rule="evenodd"
          />
        </svg>
      </a>
    </div>
  </section>
</template>
