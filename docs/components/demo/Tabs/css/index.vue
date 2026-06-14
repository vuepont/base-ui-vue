<script setup lang="ts">
import {
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsRoot,
  TabsTab,
} from 'base-ui-vue'
</script>

<template>
  <TabsRoot class="Tabs" default-value="overview">
    <TabsList class="List">
      <TabsTab class="Tab" value="overview">
        Overview
      </TabsTab>
      <TabsTab class="Tab" value="projects">
        Projects
      </TabsTab>
      <TabsTab class="Tab" value="account">
        Account
      </TabsTab>
      <TabsIndicator class="Indicator" />
    </TabsList>
    <div class="PanelViewport">
      <TabsPanel class="Panel" value="overview">
        <p class="Paragraph">
          Workspace stats and activity.
        </p>
      </TabsPanel>
      <TabsPanel class="Panel" value="projects">
        <p class="Paragraph">
          Milestones and deadlines.
        </p>
      </TabsPanel>
      <TabsPanel class="Panel" value="account">
        <p class="Paragraph">
          Profile and preferences.
        </p>
      </TabsPanel>
    </div>
  </TabsRoot>
</template>

<style src="./styles.css"></style>
