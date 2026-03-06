<script setup lang="ts">
import { FieldsetLegend, FieldsetRoot } from 'base-ui-vue'
</script>

<template>
  <FieldsetRoot class="flex w-full max-w-64 flex-col gap-4 border-0 m-0 p-0">
    <FieldsetLegend class="border-b border-gray-200 pb-3 text-lg font-medium text-gray-900">
      Billing details
    </FieldsetLegend>

    <div class="flex flex-col items-start gap-1">
      <label class="text-sm font-medium text-gray-900">Company</label>
      <input
        placeholder="Enter company name"
        class="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
      >
    </div>

    <div class="flex flex-col items-start gap-1">
      <label class="text-sm font-medium text-gray-900">Tax ID</label>
      <input
        placeholder="Enter fiscal number"
        class="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
      >
    </div>
  </FieldsetRoot>
</template>
