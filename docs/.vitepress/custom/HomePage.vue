<script setup lang="ts">
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionRoot,
  AccordionTrigger,
} from 'base-ui-vue'
import {
  baseUi,
  discord,
  github,
  npm,
} from '../meta'

const docsLink = '/docs/overview/quick-start'
const copyrightHolder = 'VuePont'
const copyrightYear = '2026'

const faqs = [
  {
    answer:
      'Base UI Vue is a library of unstyled, accessible UI primitives for Vue.js. It provides the behavior and accessibility for common patterns while leaving styling entirely to your system.',
    question: 'What is base-ui-vue?',
    value: 'what-is-base-ui-vue',
  },
  {
    answer:
      'Yes. The components ship without opinionated CSS, so they work with Tailwind CSS, CSS-in-JS, plain CSS, and any other styling library you prefer.',
    question: 'Does it work with any styling library?',
    value: 'styling-library',
  },
  {
    answer:
      'Yes. The library is designed to work in Vue SSR environments, including Nuxt.',
    question: 'Can I use it with Nuxt?',
    value: 'nuxt',
  },
] as const
</script>

<template>
  <div class="min-h-screen bg-white text-black antialiased transition-colors dark:bg-zinc-950 dark:text-zinc-50">
    <main class="mx-auto max-w-3xl space-y-24 px-6 pt-8 pb-16 md:pt-10 md:pb-20">
      <section class="space-y-14 md:space-y-16">
        <a href="/" class="block text-sm font-semibold tracking-tight">
          Base UI Vue
        </a>

        <header class="space-y-8">
          <p class="text-xs tracking-[0.28em] text-zinc-400 uppercase dark:text-zinc-500">
            An unofficial port of
            <a
              :href="baseUi"
              class="border-b border-indigo-300/90 pb-0.5 text-zinc-700 transition-colors hover:text-black dark:text-zinc-200 dark:hover:text-white"
              rel="noreferrer"
              target="_blank"
            >
              Base UI
            </a>
          </p>

          <h1 class="max-w-4xl text-4xl leading-none font-semibold tracking-tight text-balance md:text-6xl">
            Unstyled UI components for building accessible user interfaces in Vue.js.
          </h1>

          <div>
            <a
              :href="docsLink"
              class="inline-flex items-center text-sm font-medium decoration-1 underline-offset-4 transition hover:underline"
            >
              Documentation
              <svg viewBox="0 0 20 20" fill="currentColor" class="ml-1 size-4">
                <path
                  fill-rule="evenodd"
                  d="M3.5 10a.75.75 0 0 1 .75-.75h9.69L10.72 6.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H4.25A.75.75 0 0 1 3.5 10Z"
                  clip-rule="evenodd"
                />
              </svg>
            </a>
          </div>
        </header>
      </section>

      <section class="space-y-12">
        <h2 class="text-xs font-bold tracking-[0.3em] text-zinc-500 uppercase dark:text-zinc-400">
          Architecture
        </h2>

        <div class="space-y-8 text-lg leading-relaxed text-zinc-900 dark:text-zinc-100">
          <p>
            Base UI Vue provides the logic, accessibility, and interaction patterns for your
            design system. It handles the difficult parts of building complex components like focus
            management, keyboard navigation, and ARIA attributes while leaving the styling entirely
            to you.
          </p>

          <div class="grid grid-cols-1 gap-12 pt-4">
            <div class="space-y-3">
              <h3 class="text-sm font-bold tracking-tight uppercase">
                Composability First
              </h3>
              <p class="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Components are built as primitives that can be composed together. Use slots and
                props to build exactly what you need without fighting against opinionated CSS.
              </p>
            </div>

            <div class="space-y-3">
              <h3 class="text-sm font-bold tracking-tight uppercase">
                Engineered for Access
              </h3>
              <p class="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Every component follows the WAI-ARIA Authoring Practices. We have done the heavy
                lifting to ensure your users have a first-class experience regardless of how they
                navigate.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-12">
        <h2 class="text-xs font-bold tracking-[0.3em] text-zinc-500 uppercase dark:text-zinc-400">
          FAQ
        </h2>

        <AccordionRoot class="border-y border-black/5 dark:border-white/10">
          <AccordionItem
            v-for="faq in faqs"
            :key="faq.value"
            :value="faq.value"
            class="border-t border-black/5 first:border-t-0 dark:border-white/10"
          >
            <AccordionHeader class="m-0!">
              <AccordionTrigger
                class="group flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950 dark:focus-visible:outline-zinc-50"
              >
                <span>{{ faq.question }}</span>
                <svg
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  class="size-3 shrink-0 transition-transform duration-200 group-data-panel-open:rotate-45"
                >
                  <path d="M6.75 0H5.25V5.25H0V6.75H5.25V12H6.75V6.75H12V5.25H6.75V0Z" />
                </svg>
              </AccordionTrigger>
            </AccordionHeader>

            <AccordionPanel
              class="h-(--accordion-panel-height) overflow-hidden text-sm leading-relaxed text-zinc-500 transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 dark:text-zinc-400"
            >
              <div class="pb-4 pr-10">
                {{ faq.answer }}
              </div>
            </AccordionPanel>
          </AccordionItem>
        </AccordionRoot>
      </section>
    </main>

    <footer class="mx-auto max-w-3xl border-t border-black/5 px-6 pt-12 pb-24 dark:border-white/10">
      <div class="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div class="text-[10px] font-medium tracking-[0.3em] text-zinc-400 uppercase dark:text-zinc-500">
          © {{ copyrightYear }} {{ copyrightHolder }}. All rights reserved.
        </div>

        <div class="flex items-center gap-6 text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase dark:text-zinc-400">
          <a
            :href="discord"
            class="transition-colors hover:text-black dark:hover:text-white"
            rel="noreferrer"
            target="_blank"
          >
            Discord
          </a>
          <a
            :href="github"
            class="transition-colors hover:text-black dark:hover:text-white"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <a
            :href="npm"
            class="transition-colors hover:text-black dark:hover:text-white"
            rel="noreferrer"
            target="_blank"
          >
            NPM
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>
