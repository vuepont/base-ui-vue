<script setup lang="ts">
import {
  Toggle,
  ToggleGroup,
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
    <ToggleGroup class="Group" aria-label="Alignment">
      <Toggle class="Button ButtonWide" value="align-left" aria-label="Align left">
        Align Left
      </Toggle>
      <Toggle class="Button ButtonWide" value="align-right" aria-label="Align right">
        Align Right
      </Toggle>
    </ToggleGroup>
    <ToolbarSeparator class="Separator" />
    <ToolbarGroup class="Group" aria-label="Numerical format">
      <ToolbarButton class="Button" aria-label="Format as currency">
        $
      </ToolbarButton>
      <ToolbarButton class="Button" aria-label="Format as percent">
        %
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
