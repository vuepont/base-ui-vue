<script setup lang="ts">
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionRoot,
  AccordionTrigger,
} from 'base-ui-vue'
</script>

<template>
  <AccordionRoot multiple class="flex w-96 max-w-[calc(100vw-8rem)] flex-col justify-center text-gray-900">
    <AccordionItem class="border-b border-gray-200">
      <AccordionHeader class="m-0!">
        <AccordionTrigger class="group relative flex w-full items-baseline justify-between gap-4 bg-gray-50 py-2 pr-1 pl-3 text-left text-base leading-6 font-medium hover:bg-gray-100 focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-blue-800">
          What is Base UI Vue?
          <svg class="mr-2 size-3 shrink-0 transition-all ease-out group-data-panel-open:scale-110 group-data-panel-open:rotate-45" viewBox="0 0 12 12" fill="currentcolor">
            <path d="M6.75 0H5.25V5.25H0V6.75L5.25 6.75V12H6.75V6.75L12 6.75V5.25H6.75V0Z" />
          </svg>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel class="h-(--accordion-panel-height) overflow-hidden text-base text-gray-600 transition-[height] ease-out data-ending-style:h-0 data-starting-style:h-0">
        <div class="p-3">
          Base UI Vue is a library of high-quality unstyled Vue components for design systems and
          web apps.
        </div>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem class="border-b border-gray-200">
      <AccordionHeader class="m-0!">
        <AccordionTrigger class="group relative flex w-full items-baseline justify-between gap-4 bg-gray-50 py-2 pr-1 pl-3 text-left text-base leading-6 font-medium hover:bg-gray-100 focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-blue-800">
          How do I get started?
          <svg class="mr-2 size-3 shrink-0 transition-all ease-out group-data-panel-open:scale-110 group-data-panel-open:rotate-45" viewBox="0 0 12 12" fill="currentcolor">
            <path d="M6.75 0H5.25V5.25H0V6.75L5.25 6.75V12H6.75V6.75L12 6.75V5.25H6.75V0Z" />
          </svg>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel class="h-(--accordion-panel-height) overflow-hidden text-base text-gray-600 transition-[height] ease-out data-ending-style:h-0 data-starting-style:h-0">
        <div class="p-3">
          Head to the "Quick start" guide in the docs. If you've used unstyled libraries before,
          you'll feel at home.
        </div>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem class="border-b border-gray-200">
      <AccordionHeader class="m-0!">
        <AccordionTrigger class="group relative flex w-full items-baseline justify-between gap-4 bg-gray-50 py-2 pr-1 pl-3 text-left text-base leading-6 font-medium hover:bg-gray-100 focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-blue-800">
          Can I use it for my project?
          <svg class="mr-2 size-3 shrink-0 transition-all ease-out group-data-panel-open:scale-110 group-data-panel-open:rotate-45" viewBox="0 0 12 12" fill="currentcolor">
            <path d="M6.75 0H5.25V5.25H0V6.75L5.25 6.75V12H6.75V6.75L12 6.75V5.25H6.75V0Z" />
          </svg>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel class="h-(--accordion-panel-height) overflow-hidden text-base text-gray-600 transition-[height] ease-out data-ending-style:h-0 data-starting-style:h-0">
        <div class="p-3">
          Of course! Base UI Vue is free and open source.
        </div>
      </AccordionPanel>
    </AccordionItem>
  </AccordionRoot>
</template>
