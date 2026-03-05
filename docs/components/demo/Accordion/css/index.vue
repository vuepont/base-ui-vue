<script setup lang="ts">
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionRoot,
  AccordionTrigger,
} from 'base-ui-vue'
import './styles.css'
</script>

<template>
  <AccordionRoot class="Accordion">
    <AccordionItem class="Item">
      <AccordionHeader class="Header">
        <AccordionTrigger class="Trigger">
          What is Base UI Vue?
          <svg class="TriggerIcon" viewBox="0 0 12 12" fill="currentcolor">
            <path d="M6.75 0H5.25V5.25H0V6.75L5.25 6.75V12H6.75V6.75L12 6.75V5.25H6.75V0Z" />
          </svg>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel class="Panel">
        <div class="Content">
          Base UI Vue is a library of high-quality unstyled Vue components for design systems and
          web apps.
        </div>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem class="Item">
      <AccordionHeader class="Header">
        <AccordionTrigger class="Trigger">
          How do I get started?
          <svg class="TriggerIcon" viewBox="0 0 12 12" fill="currentcolor">
            <path d="M6.75 0H5.25V5.25H0V6.75L5.25 6.75V12H6.75V6.75L12 6.75V5.25H6.75V0Z" />
          </svg>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel class="Panel">
        <div class="Content">
          Head to the "Quick start" guide in the docs. If you've used unstyled libraries before,
          you'll feel at home.
        </div>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem class="Item">
      <AccordionHeader class="Header">
        <AccordionTrigger class="Trigger">
          Can I use it for my project?
          <svg class="TriggerIcon" viewBox="0 0 12 12" fill="currentcolor">
            <path d="M6.75 0H5.25V5.25H0V6.75L5.25 6.75V12H6.75V6.75L12 6.75V5.25H6.75V0Z" />
          </svg>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel class="Panel">
        <div class="Content">
          Of course! Base UI Vue is free and open source.
        </div>
      </AccordionPanel>
    </AccordionItem>
  </AccordionRoot>
</template>
