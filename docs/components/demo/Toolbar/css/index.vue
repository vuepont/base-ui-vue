<script setup lang="ts">
import {
  Toggle,
  ToggleGroup,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarRoot,
  ToolbarSeparator,
} from 'base-ui-vue'
</script>

<template>
  <div class="ToolbarDemo">
    <ToolbarRoot class="Toolbar" aria-label="Text formatting">
      <ToggleGroup class="Group" aria-label="Alignment">
        <ToolbarButton :as="Toggle" class="Button" value="align-left" aria-label="Align left">
          Align Left
        </ToolbarButton>
        <ToolbarButton :as="Toggle" class="Button" value="align-right" aria-label="Align right">
          Align Right
        </ToolbarButton>
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
      <!-- TODO: Replace this HTML select trigger stand-in with Select once the Vue package includes it. -->
      <button
        type="button"
        class="Button"
        role="combobox"
        aria-label="Font family"
        aria-haspopup="listbox"
        aria-expanded="false"
      >
        <span>Helvetica</span>
        <span class="SelectIcon" aria-hidden="true">
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M0.5 4.5L4 1.5L7.5 4.5" />
            <path d="M0.5 7.5L4 10.5L7.5 7.5" />
          </svg>
        </span>
      </button>
      <ToolbarSeparator class="Separator" />
      <ToolbarLink class="Link" href="#toolbar-demo">
        Edited 51m ago
      </ToolbarLink>
    </ToolbarRoot>
  </div>
</template>

<style src="./styles.css"></style>
