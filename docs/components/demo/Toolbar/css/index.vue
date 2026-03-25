<script setup lang="ts">
// TODO: Replace this simplified formatting-toolbar demo with the richer React
// docs example once the Vue package has companion components like ToggleGroup
// and Select for a full editor-style toolbar composition.
import {
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarRoot,
  ToolbarSeparator,
} from 'base-ui-vue'
</script>

<template>
  <ToolbarRoot class="Toolbar" aria-label="Text formatting">
    <ToolbarGroup class="Group" aria-label="Text style">
      <ToolbarButton class="Button" aria-label="Bold">
        B
      </ToolbarButton>
      <ToolbarButton class="Button" aria-label="Italic">
        I
      </ToolbarButton>
      <ToolbarButton class="Button" aria-label="Underline">
        U
      </ToolbarButton>
    </ToolbarGroup>
    <ToolbarSeparator class="Separator" />
    <ToolbarGroup class="Group" aria-label="Alignment">
      <ToolbarButton class="Button ButtonWide" aria-label="Align left">
        Left
      </ToolbarButton>
      <ToolbarButton class="Button ButtonWide" aria-label="Align center">
        Center
      </ToolbarButton>
    </ToolbarGroup>
    <ToolbarSeparator class="Separator" />
    <ToolbarInput class="Input" default-value="12" aria-label="Font size" />
    <ToolbarLink class="Link" href="#toolbar-demo">
      Edited 51m ago
    </ToolbarLink>
  </ToolbarRoot>
</template>

<style scoped src="./styles.css"></style>
