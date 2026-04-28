<script setup lang="ts">
import {
  ScrollAreaContent,
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from 'base-ui-vue'
</script>

<template>
  <ScrollAreaRoot class="box-border h-48 w-96 max-w-[calc(100vw-8rem)] rounded-lg bg-gray-50">
    <ScrollAreaViewport class="h-full rounded-md bg-gray-50 mask-linear-[to_bottom,transparent_0,black_min(40px,var(--scroll-area-overflow-y-start)),black_calc(100%-min(40px,var(--scroll-area-overflow-y-end,40px))),transparent_100%] mask-no-repeat focus-visible:outline-2 focus-visible:outline-blue-800">
      <ScrollAreaContent class="flex flex-col gap-4 py-3 pl-4 pr-6 text-sm leading-5.5 text-gray-900">
        <p>
          Vernacular architecture is building done outside any academic tradition, and without
          professional guidance. It is not a particular architectural movement or style, but
          rather a broad category, encompassing a wide range and variety of building types, with
          differing methods of construction, from around the world, both historical and extant and
          classical and modern. Vernacular architecture constitutes 95% of the world's built
          environment, as estimated in 1995 by Amos Rapoport, as measured against the small
          percentage of new buildings every year designed by architects and built by engineers.
        </p>
        <p>
          This type of architecture usually serves immediate, local needs, is constrained by the
          materials available in its particular region and reflects local traditions and cultural
          practices. The study of vernacular architecture does not examine formally schooled
          architects, but instead that of the design skills and tradition of local builders, who
          were rarely given any attribution for the work. More recently, vernacular architecture
          has been examined by designers and the building industry in an effort to be more energy
          conscious with contemporary design and construction—part of a broader interest in
          sustainable design.
        </p>
      </ScrollAreaContent>
    </ScrollAreaViewport>
    <ScrollAreaScrollbar class="pointer-events-none m-2 flex w-1 justify-center rounded-sm bg-gray-200 opacity-0 transition-opacity duration-150 before:absolute before:h-full before:w-5 before:content-[''] data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0">
      <ScrollAreaThumb class="w-full rounded-sm bg-gray-500" />
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template>
