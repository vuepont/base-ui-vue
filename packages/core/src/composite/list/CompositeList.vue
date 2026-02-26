<!-- eslint-disable vue/no-mutating-props -->
<script setup lang="ts" generic="Metadata">
import type { Ref } from 'vue'
import { computed, onBeforeUnmount, provide, ref, shallowRef, watch } from 'vue'
import { compositeListContextKey } from './CompositeListContext'

export type CompositeMetadata<CustomMetadata> = {
  index?: number | null | undefined
} & CustomMetadata

const props = defineProps<{
  elementsRef: Ref<Array<HTMLElement | null>>
  labelsRef?: Ref<Array<string | null>> | undefined
  onMapChange?: (newMap: Map<Element, CompositeMetadata<Metadata> | null>) => void
}>()

const nextIndexRef = ref(0)
type MapChangeListener = (map: Map<Element, CompositeMetadata<Metadata> | null>) => void
const listeners = ref(new Set<MapChangeListener>())

const map = shallowRef<Map<Element, CompositeMetadata<Metadata> | null>>(new Map())
const mapTick = ref(0)
let lastTick = 0

function register(node: Element, metadata: Metadata) {
  map.value.set(node, metadata as any)
  lastTick += 1
  mapTick.value = lastTick
}

function unregister(node: Element) {
  map.value.delete(node)
  lastTick += 1
  mapTick.value = lastTick
}

function sortByDocumentPosition(a: Element, b: Element) {
  const position = a.compareDocumentPosition(b)
  if (
    position & Node.DOCUMENT_POSITION_FOLLOWING
    || position & Node.DOCUMENT_POSITION_CONTAINED_BY
  ) {
    return -1
  }
  if (
    position & Node.DOCUMENT_POSITION_PRECEDING
    || position & Node.DOCUMENT_POSITION_CONTAINS
  ) {
    return 1
  }
  return 0
}

const sortedMap = computed(() => {
  // `mapTick` is the reactive trigger as `map` is stable (shallowRef).
  void mapTick.value

  const newMap = new Map<Element, CompositeMetadata<Metadata>>()
  const sortedNodes = Array.from(map.value.keys())
    .filter(node => node.isConnected)
    .sort(sortByDocumentPosition)

  sortedNodes.forEach((node, index) => {
    const metadata = map.value.get(node) ?? ({} as CompositeMetadata<Metadata>)
    newMap.set(node, { ...metadata, index })
  })

  return newMap
})

let observer: MutationObserver | null = null

watch(
  sortedMap,
  (newSortedMap) => {
    if (typeof MutationObserver !== 'function' || newSortedMap.size === 0) {
      if (observer) {
        observer.disconnect()
        observer = null
      }
      return
    }

    if (!observer) {
      observer = new MutationObserver((entries) => {
        const diff = new Set<Node>()
        const updateDiff = (node: Node) => (diff.has(node) ? diff.delete(node) : diff.add(node))
        entries.forEach((entry) => {
          entry.removedNodes.forEach(updateDiff)
          entry.addedNodes.forEach(updateDiff)
        })
        if (diff.size === 0) {
          lastTick += 1
          mapTick.value = lastTick
        }
      })
    }
    else {
      observer.disconnect()
    }

    newSortedMap.forEach((_, node) => {
      if (node.parentElement) {
        observer!.observe(node.parentElement, { childList: true })
      }
    })
  },
  { immediate: true, flush: 'post' },
)

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})

watch(
  sortedMap,
  (newSortedMap) => {
    const shouldUpdateLengths = lastTick === mapTick.value
    if (shouldUpdateLengths) {
      if (props.elementsRef.value.length !== newSortedMap.size) {
        props.elementsRef.value.length = newSortedMap.size
      }
      if (props.labelsRef && props.labelsRef.value.length !== newSortedMap.size) {
        props.labelsRef.value.length = newSortedMap.size
      }
      nextIndexRef.value = newSortedMap.size
    }

    if (props.onMapChange) {
      props.onMapChange(newSortedMap as any)
    }

    listeners.value.forEach(l => l(newSortedMap))
  },
  { immediate: true, flush: 'post' },
)

onBeforeUnmount(() => {
  if (props.elementsRef) {
    props.elementsRef.value = []
  }
  if (props.labelsRef) {
    props.labelsRef.value = []
  }
})

function subscribeMapChange(fn: (map: Map<Element, CompositeMetadata<Metadata> | null>) => void) {
  listeners.value.add(fn)
  return () => {
    listeners.value.delete(fn)
  }
}

provide(compositeListContextKey, {
  register,
  unregister,
  subscribeMapChange,
  elementsRef: props.elementsRef,
  labelsRef: props.labelsRef,
  nextIndexRef,
})
</script>

<template>
  <slot />
</template>
