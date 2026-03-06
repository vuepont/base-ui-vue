<script setup lang="ts">
import { FieldsetLegend, FieldsetRoot } from 'base-ui-vue'
import './styles.css'
</script>

<template>
  <FieldsetRoot class="Fieldset">
    <FieldsetLegend class="Legend">
      Billing details
    </FieldsetLegend>

    <div class="Field">
      <label class="Label">Company</label>
      <input placeholder="Enter company name" class="Input">
    </div>

    <div class="Field">
      <label class="Label">Tax ID</label>
      <input placeholder="Enter fiscal number" class="Input">
    </div>
  </FieldsetRoot>
</template>
