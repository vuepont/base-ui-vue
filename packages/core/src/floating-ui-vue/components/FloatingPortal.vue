<script lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type {
  FloatingPortalFocusManagerState,
  FloatingPortal as FloatingPortalTypes,
} from './FloatingPortal'
</script>

<script setup lang="ts">
import {
  computed,
  provide,
  shallowRef,
  unref,
  useAttrs,
  watch,
} from 'vue'
import { addEventListener } from '../../utils/addEventListener'
import { ownerVisuallyHidden } from '../../utils/constants'
import { createChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import FocusGuard from '../../utils/FocusGuard.vue'
import { mergeCleanups } from '../../utils/mergeCleanups'
import { REASONS } from '../../utils/reasons'
import {
  disableFocusInside,
  enableFocusInside,
  getNextTabbable,
  getPreviousTabbable,
  isOutsideEvent,
} from '../utils/tabbable'
import {
  floatingPortalContextKey,
  useFloatingPortalNode,
} from './FloatingPortal'

export interface FloatingPortalState {}

export interface FloatingPortalProps
  extends FloatingPortalTypes.Props<FloatingPortalState> {
  /**
   * Vue Teleport target. Prefer `container` for React API parity.
   */
  to?: FloatingPortalTypes.Target
  /**
   * Whether to render focus guards around the portal.
   */
  renderGuards?: boolean
  /**
   * Disables Vue Teleport while preserving portal mounting behavior.
   * @default false
   */
  disabled?: boolean
}

type FocusGuardTemplateRef
  = | Element
    | ComponentPublicInstance
    | { element?: HTMLSpanElement | null }
    | null

defineOptions({
  name: 'FloatingPortal',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FloatingPortalProps>(), {
  as: 'div',
  disabled: false,
})

const attrs = useAttrs()

const state = computed<FloatingPortalState>(() => ({}))
const focusManagerState = shallowRef<FloatingPortalFocusManagerState>(null)
const focusInsideDisabled = shallowRef(false)

const beforeOutsideRef = shallowRef<HTMLSpanElement | null>(null)
const afterOutsideRef = shallowRef<HTMLSpanElement | null>(null)
const beforeInsideRef = shallowRef<HTMLSpanElement | null>(null)
const afterInsideRef = shallowRef<HTMLSpanElement | null>(null)

const {
  portalNode,
  portalTarget,
  shouldRender,
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useFloatingPortalNode({
  container: () => props.container,
  to: () => props.to,
  componentProps: props,
  elementProps: computed(() => attrs),
  state,
})

const shouldRenderGuards = computed(() => {
  if (typeof props.renderGuards === 'boolean') {
    return props.renderGuards
  }

  const manager = focusManagerState.value

  return !!manager && !manager.modal && manager.open && !!portalNode.value
})

function setFocusManagerState(
  next:
    | FloatingPortalFocusManagerState
    | ((prev: FloatingPortalFocusManagerState) => FloatingPortalFocusManagerState),
) {
  focusManagerState.value = typeof next === 'function'
    ? next(focusManagerState.value)
    : next
}

watch(
  [portalNode, () => focusManagerState.value?.modal],
  ([node, modal], _previous, onCleanup) => {
    if (!node || modal) {
      return
    }

    function onFocus(event: FocusEvent) {
      if (!node || !event.relatedTarget || !isOutsideEvent(event)) {
        return
      }

      if (event.type === 'focusin') {
        if (focusInsideDisabled.value) {
          enableFocusInside(node)
          focusInsideDisabled.value = false
        }
      }
      else {
        disableFocusInside(node)
        focusInsideDisabled.value = true
      }
    }

    onCleanup(mergeCleanups(
      addEventListener(node, 'focusin', onFocus, true),
      addEventListener(node, 'focusout', onFocus, true),
    ))
  },
  { immediate: true },
)

watch(
  [portalNode, () => focusManagerState.value?.open],
  ([node, open]) => {
    if (!node || open !== true || !focusInsideDisabled.value) {
      return
    }

    enableFocusInside(node)
    focusInsideDisabled.value = false
  },
  { immediate: true, flush: 'post' },
)

provide(floatingPortalContextKey, {
  beforeOutsideRef,
  afterOutsideRef,
  beforeInsideRef,
  afterInsideRef,
  portalNode,
  setFocusManagerState,
})

function handleBeforeOutsideFocus(event: FocusEvent) {
  if (portalNode.value && isOutsideEvent(event, portalNode.value)) {
    beforeInsideRef.value?.focus()
    return
  }

  const domReference = focusManagerState.value?.domReference ?? null
  getPreviousTabbable(domReference)?.focus()
}

function handleAfterOutsideFocus(event: FocusEvent) {
  if (portalNode.value && isOutsideEvent(event, portalNode.value)) {
    afterInsideRef.value?.focus()
    return
  }

  const manager = focusManagerState.value
  const domReference = manager?.domReference ?? null

  getNextTabbable(domReference)?.focus()

  if (manager?.closeOnFocusOut) {
    manager.onOpenChange(
      false,
      createChangeEventDetails(REASONS.focusOut, event),
    )
  }
}

function setBeforeOutsideRef(value: FocusGuardTemplateRef) {
  beforeOutsideRef.value = resolveFocusGuardElement(value)
}

function setAfterOutsideRef(value: FocusGuardTemplateRef) {
  afterOutsideRef.value = resolveFocusGuardElement(value)
}

function resolveFocusGuardElement(value: FocusGuardTemplateRef) {
  if (!value) {
    return null
  }

  if (value instanceof HTMLSpanElement) {
    return value
  }

  if ('element' in value) {
    const element = unref(value.element)
    return element instanceof HTMLSpanElement ? element : null
  }

  if ('$el' in value && value.$el instanceof HTMLSpanElement) {
    return value.$el
  }

  return null
}

defineExpose({
  element: portalNode,
})
</script>

<template>
  <FocusGuard
    v-if="shouldRenderGuards && portalNode"
    :ref="setBeforeOutsideRef"
    data-type="outside"
    @focus="handleBeforeOutsideFocus"
  />
  <span
    v-if="shouldRenderGuards && portalNode"
    :aria-owns="portalNode.id"
    :style="ownerVisuallyHidden"
  />
  <Teleport v-if="shouldRender" :to="portalTarget" :disabled="disabled">
    <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
    <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
      <slot :state="state" />
    </component>
  </Teleport>
  <FocusGuard
    v-if="shouldRenderGuards && portalNode"
    :ref="setAfterOutsideRef"
    data-type="outside"
    @focus="handleAfterOutsideFocus"
  />
</template>
