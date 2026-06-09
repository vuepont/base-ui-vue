<script setup lang="ts">
import {
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsRoot,
  TabsTab,
} from 'base-ui-vue'

const tabClass
  = 'flex h-[calc(2rem+1px)] items-center justify-center bg-transparent px-2 py-0 font-inherit text-sm font-normal leading-5 break-keep whitespace-nowrap text-neutral-600 outline-none select-none hover:text-neutral-950 focus-visible:-outline-offset-1 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-neutral-950 data-active:text-neutral-950 dark:text-neutral-300 dark:hover:text-white dark:focus-visible:outline-white dark:data-active:text-white'

const panelClass
  = 'col-start-1 row-start-1 flex w-full items-center justify-center bg-white p-4 text-center text-sm text-neutral-950 outline-none focus-visible:z-1 focus-visible:-outline-offset-1 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-neutral-950 dark:bg-neutral-950 dark:text-white dark:focus-visible:outline-white [[hidden]]:hidden'
</script>

<template>
  <TabsRoot class="w-full max-w-xs" default-value="overview">
    <TabsList class="relative z-1 -mb-px flex gap-1">
      <TabsTab :class="tabClass" value="overview">
        Overview
      </TabsTab>
      <TabsTab :class="tabClass" value="projects">
        Projects
      </TabsTab>
      <TabsTab :class="tabClass" value="account">
        Account
      </TabsTab>
      <TabsIndicator class="absolute top-0 left-0 -z-1 h-full w-(--active-tab-width) translate-x-(--active-tab-left) border-x border-t border-neutral-950 bg-white transition-[translate,width] duration-150 ease-in-out dark:border-white dark:bg-neutral-950" />
    </TabsList>
    <div class="grid min-h-32 w-full grid-cols-1 border border-neutral-950 dark:border-white">
      <TabsPanel :class="panelClass" value="overview">
        <p>Workspace stats and activity.</p>
      </TabsPanel>
      <TabsPanel :class="panelClass" value="projects">
        <p>Milestones and deadlines.</p>
      </TabsPanel>
      <TabsPanel :class="panelClass" value="account">
        <p>Profile and preferences.</p>
      </TabsPanel>
    </div>
  </TabsRoot>
</template>
