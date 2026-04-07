<script setup lang="ts">
import { sponsors, sponsorsCta, sponsorsTitle } from '../meta'
import SponsorTile from './SponsorTile.vue'
</script>

<template>
  <section
    v-if="sponsors.length"
    class="vp-sponsors-sidebar"
    aria-labelledby="sidebar-sponsors"
  >
    <p id="sidebar-sponsors" class="vp-sponsors-sidebar__title">
      {{ sponsorsTitle }}
    </p>

    <div class="vp-sponsors-sidebar__grid">
      <SponsorTile
        v-for="sponsor in sponsors"
        :key="sponsor.name"
        compact
        :alt="sponsor.alt"
        :href="sponsor.href"
        :logo="sponsor.logo"
        :name="sponsor.name"
      />

      <SponsorTile
        compact
        :href="sponsorsCta.href"
        :name="sponsorsCta.name"
      />
    </div>
  </section>
</template>

<style scoped>
.vp-sponsors-sidebar {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--vp-c-divider);
}

.vp-sponsors-sidebar__title {
  margin: 0 0 0.75rem;
  color: var(--vp-c-text-2);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.vp-sponsors-sidebar__grid {
  display: grid;
  gap: 0.5rem;
}
</style>
