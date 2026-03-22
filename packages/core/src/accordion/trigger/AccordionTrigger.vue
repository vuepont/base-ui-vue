<script setup lang="ts">
import type { AccordionTriggerProps } from '../accordion.types'
import { computed, onBeforeUnmount, useAttrs, watch } from 'vue'
import { useCollapsibleRootContext } from '../../collapsible/root/CollapsibleRootContext'
import {
  ARROW_DOWN,
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  END,
  HOME,
  stopEvent,
} from '../../composite/composite'
import { useButton } from '../../use-button'
import { triggerOpenStateMapping } from '../../utils/collapsibleOpenStateMapping'
import { isElementDisabled } from '../../utils/isElementDisabled'
import { useRenderElement } from '../../utils/useRenderElement'
import { useAccordionItemContext } from '../item/AccordionItemContext'
import { useAccordionRootContext } from '../root/AccordionRootContext'

defineOptions({
  name: 'AccordionTrigger',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<AccordionTriggerProps>(), {
  as: 'button',
  nativeButton: true,
})

const attrs = useAttrs()

const collapsibleCtx = useCollapsibleRootContext()
const rootCtx = useAccordionRootContext()
const itemCtx = useAccordionItemContext()

const disabled = computed(() => collapsibleCtx.disabled.value || props.disabled)

const { getButtonProps, buttonRef } = useButton({
  disabled: () => disabled.value,
  focusableWhenDisabled: () => true,
  native: () => props.nativeButton ?? true,
})

watch(
  () => props.id,
  (id) => {
    if (id) {
      itemCtx.setTriggerId(id)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  itemCtx.setTriggerId(undefined)
})

const SUPPORTED_KEYS = new Set([ARROW_DOWN, ARROW_UP, ARROW_RIGHT, ARROW_LEFT, HOME, END])

function getActiveTriggers(): HTMLElement[] {
  const accordionItemElements = rootCtx.accordionItemRefs.value
  const output: HTMLElement[] = []

  for (let i = 0; i < accordionItemElements.length; i += 1) {
    const section = accordionItemElements[i]
    if (!isElementDisabled(section)) {
      const trigger = section?.querySelector<HTMLElement>('[type="button"], [role="button"]')
      if (trigger && !isElementDisabled(trigger)) {
        output.push(trigger)
      }
    }
  }

  return output
}

function handleKeyDown(event: KeyboardEvent) {
  if (!SUPPORTED_KEYS.has(event.key)) {
    return
  }

  stopEvent(event)

  const triggers = getActiveTriggers()
  const numOfEnabledTriggers = triggers.length
  const lastIndex = numOfEnabledTriggers - 1
  let nextIndex = -1
  const thisIndex = triggers.indexOf(event.target as HTMLButtonElement)

  const isRtl = rootCtx.direction.value === 'rtl'
  const isHorizontal = rootCtx.orientation.value === 'horizontal'
  const loopFocus = rootCtx.loopFocus.value

  function toNext() {
    if (loopFocus) {
      nextIndex = thisIndex + 1 > lastIndex ? 0 : thisIndex + 1
    }
    else {
      nextIndex = Math.min(thisIndex + 1, lastIndex)
    }
  }

  function toPrev() {
    if (loopFocus) {
      nextIndex = thisIndex === 0 ? lastIndex : thisIndex - 1
    }
    else {
      nextIndex = thisIndex - 1
    }
  }

  switch (event.key) {
    case ARROW_DOWN:
      if (!isHorizontal) {
        toNext()
      }
      break
    case ARROW_UP:
      if (!isHorizontal) {
        toPrev()
      }
      break
    case ARROW_RIGHT:
      if (isHorizontal) {
        if (isRtl) {
          toPrev()
        }
        else {
          toNext()
        }
      }
      break
    case ARROW_LEFT:
      if (isHorizontal) {
        if (isRtl) {
          toNext()
        }
        else {
          toPrev()
        }
      }
      break
    case HOME:
      nextIndex = 0
      break
    case END:
      nextIndex = lastIndex
      break
    default:
      break
  }

  if (nextIndex > -1) {
    triggers[nextIndex].focus()
  }
}

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state: itemCtx.state,
  props: computed(() => getButtonProps({
    ...attrs as Record<string, any>,
    'id': itemCtx.triggerId.value,
    'aria-controls': collapsibleCtx.open.value ? collapsibleCtx.panelId.value : undefined,
    'aria-expanded': collapsibleCtx.open.value,
    'onClick': collapsibleCtx.handleTrigger,
    'onKeydown': handleKeyDown,
  })),
  stateAttributesMapping: triggerOpenStateMapping,
  defaultTagName: 'button',
  ref: buttonRef,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="itemCtx.state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="itemCtx.state" />
  </component>
</template>
