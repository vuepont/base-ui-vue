<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { NumberFieldRootState } from '../root/NumberFieldRoot.vue'
import { computed, onMounted, provide, ref, useAttrs, watch } from 'vue'
import { getTarget } from '../../floating-ui-vue/utils'
import { mergeProps } from '../../merge-props/mergeProps'
import { createGenericEventDetails } from '../../utils/createBaseUIEventDetails'
import { isFirefox, isWebKit } from '../../utils/detectBrowser'
import { ownerDocument, ownerWindow } from '../../utils/owner'
import { REASONS } from '../../utils/reasons'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTimeout } from '../../utils/useTimeout'
import { useNumberFieldRootContext } from '../root/NumberFieldRootContext'
import { DEFAULT_STEP } from '../utils/constants'
import { getViewportRect } from '../utils/getViewportRect'
import { stateAttributesMapping } from '../utils/stateAttributesMapping'
import { subscribeToVisualViewportResize } from '../utils/subscribeToVisualViewportResize'
import { numberFieldScrubAreaContextKey } from './NumberFieldScrubAreaContext'

export type NumberFieldScrubAreaState = NumberFieldRootState

export interface NumberFieldScrubAreaProps extends BaseUIComponentProps<NumberFieldScrubAreaState> {
  /**
   * Cursor movement direction in the scrub area.
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical'
  /**
   * Determines how many pixels the cursor must move before the value changes.
   * A higher value will make scrubbing less sensitive.
   * @default 2
   */
  pixelSensitivity?: number
  /**
   * If specified, determines the distance that the cursor may move from the center
   * of the scrub area before it will loop back around.
   */
  teleportDistance?: number
}

defineOptions({
  name: 'NumberFieldScrubArea',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<NumberFieldScrubAreaProps>(), {
  as: 'span',
  direction: 'horizontal',
  pixelSensitivity: 2,
})

const attrs = useAttrs()
const attrsObject = attrs as Record<string, any>

const {
  state,
  setIsScrubbing: setRootScrubbing,
  disabled,
  readOnly,
  inputRef,
  incrementValue,
  allowInputSyncRef,
  getStepAmount,
  onValueCommitted,
  lastChangedValueRef,
  valueRef,
} = useNumberFieldRootContext()

const direction = computed(() => props.direction)
const pixelSensitivity = computed(() => props.pixelSensitivity)
const teleportDistance = computed(() => props.teleportDistance)

const scrubAreaRef = ref<HTMLElement | null>(null)
const scrubAreaCursorRef = ref<HTMLElement | null>(null)

let isScrubbingInternal = false
let didMove = false
let pointerDownTarget: EventTarget | null = null
let virtualCursorCoords = { x: 0, y: 0 }
const visualScaleRef = ref(1)

const exitPointerLockTimeout = useTimeout()

const isTouchInput = ref(false)
const isPointerLockDenied = ref(false)
const isScrubbing = ref(false)

watch(
  isScrubbing,
  (scrubbing, _prev, onCleanup) => {
    if (!scrubbing || !scrubAreaCursorRef.value) {
      return
    }

    const unsubscribe = subscribeToVisualViewportResize(scrubAreaCursorRef.value, visualScaleRef)
    onCleanup(unsubscribe)
  },
  { flush: 'post' },
)

function updateCursorTransform(x: number, y: number) {
  if (scrubAreaCursorRef.value) {
    scrubAreaCursorRef.value.style.transform = `translate3d(${x}px,${y}px,0) scale(${1 / visualScaleRef.value})`
  }
}

function onScrub({ movementX, movementY }: PointerEvent) {
  const virtualCursor = scrubAreaCursorRef.value
  const scrubAreaEl = scrubAreaRef.value

  if (!virtualCursor || !scrubAreaEl) {
    return
  }

  const rect = getViewportRect(teleportDistance.value, scrubAreaEl)

  const coords = virtualCursorCoords
  const newCoords = {
    x: Math.round(coords.x + movementX),
    y: Math.round(coords.y + movementY),
  }

  const cursorWidth = virtualCursor.offsetWidth
  const cursorHeight = virtualCursor.offsetHeight

  if (newCoords.x + cursorWidth / 2 < rect.x) {
    newCoords.x = rect.width - cursorWidth / 2
  }
  else if (newCoords.x + cursorWidth / 2 > rect.width) {
    newCoords.x = rect.x - cursorWidth / 2
  }

  if (newCoords.y + cursorHeight / 2 < rect.y) {
    newCoords.y = rect.height - cursorHeight / 2
  }
  else if (newCoords.y + cursorHeight / 2 > rect.height) {
    newCoords.y = rect.y - cursorHeight / 2
  }

  virtualCursorCoords = newCoords

  updateCursorTransform(newCoords.x, newCoords.y)
}

function onScrubbingChange(scrubbingValue: boolean, { clientX, clientY }: PointerEvent) {
  isScrubbing.value = scrubbingValue
  setRootScrubbing(scrubbingValue)

  const virtualCursor = scrubAreaCursorRef.value
  if (!virtualCursor || !scrubbingValue) {
    return
  }

  const initialCoords = {
    x: clientX - virtualCursor.offsetWidth / 2,
    y: clientY - virtualCursor.offsetHeight / 2,
  }

  virtualCursorCoords = initialCoords

  updateCursorTransform(initialCoords.x, initialCoords.y)
}

// Register global scrubbing listeners only while actively scrubbing.
watch(
  [isScrubbing, disabled, readOnly],
  (_value, _prev, onCleanup) => {
    if (!inputRef.value || disabled.value || readOnly.value || !isScrubbing.value) {
      return
    }

    let cumulativeDelta = 0

    function handleScrubPointerUp(event: PointerEvent) {
      function handler() {
        try {
          ownerDocument(scrubAreaRef.value)?.exitPointerLock()
        }
        catch {
          // Ignore errors.
        }
        finally {
          isScrubbingInternal = false
          onScrubbingChange(false, event)
          onValueCommitted(
            lastChangedValueRef.value ?? valueRef.value,
            createGenericEventDetails(REASONS.scrub, event),
          )

          // Manually dispatch a click event if no movement happened, since
          // preventDefault on pointerdown prevents the browser click event.
          const target = pointerDownTarget
          const input = inputRef.value
          if (!didMove && target != null && input) {
            target.dispatchEvent(
              new (ownerWindow(input).MouseEvent)('click', {
                bubbles: true,
                cancelable: true,
              }),
            )
          }

          didMove = false
          pointerDownTarget = null
        }
      }

      if (isFirefox) {
        // Firefox needs a small delay here when soft-clicking as the pointer
        // lock will not release otherwise.
        exitPointerLockTimeout.start(20, handler)
      }
      else {
        handler()
      }
    }

    function handleScrubPointerMove(event: PointerEvent) {
      if (!isScrubbingInternal) {
        return
      }

      // Prevent text selection.
      event.preventDefault()

      onScrub(event)

      const { movementX, movementY } = event

      cumulativeDelta += direction.value === 'vertical' ? movementY : movementX

      if (Math.abs(cumulativeDelta) >= pixelSensitivity.value) {
        cumulativeDelta = 0
        didMove = true
        const dValue = direction.value === 'vertical' ? -movementY : movementX
        const stepAmount = getStepAmount(event) ?? DEFAULT_STEP
        const rawAmount = dValue * stepAmount

        if (rawAmount !== 0) {
          allowInputSyncRef.value = true
          incrementValue(Math.abs(rawAmount), {
            direction: rawAmount >= 0 ? 1 : -1,
            event,
            reason: REASONS.scrub,
          })
        }
      }
    }

    const win = ownerWindow(inputRef.value)
    win.addEventListener('pointerup', handleScrubPointerUp, true)
    win.addEventListener('pointermove', handleScrubPointerMove, true)

    onCleanup(() => {
      exitPointerLockTimeout.clear()
      win.removeEventListener('pointerup', handleScrubPointerUp, true)
      win.removeEventListener('pointermove', handleScrubPointerMove, true)
    })
  },
  { flush: 'post' },
)

// Prevent scrolling using touch input when scrubbing.
onMounted(() => {
  const element = scrubAreaRef.value
  if (!element || disabled.value || readOnly.value) {
    return
  }

  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      event.preventDefault()
    }
  }

  element.addEventListener('touchstart', handleTouchStart, { passive: false })
})

async function onPointerdown(event: PointerEvent) {
  const isMainButton = !event.button || event.button === 0
  if (event.defaultPrevented || readOnly.value || !isMainButton || disabled.value) {
    return
  }

  const isTouch = event.pointerType === 'touch'
  isTouchInput.value = isTouch

  if (event.pointerType === 'mouse') {
    event.preventDefault()
    inputRef.value?.focus()
  }

  isScrubbingInternal = true
  didMove = false
  pointerDownTarget = getTarget(event)
  onScrubbingChange(true, event)

  // WebKit causes significant layout shift with the native message, so we can't use it.
  if (!isTouch && !isWebKit) {
    try {
      // Avoid non-deterministic errors in testing environments.
      await ownerDocument(scrubAreaRef.value)?.body.requestPointerLock()
      isPointerLockDenied.value = false
    }
    catch {
      isPointerLockDenied.value = true
    }
    finally {
      if (isScrubbingInternal) {
        onScrubbingChange(true, event)
      }
    }
  }
}

const defaultProps = computed(() => ({
  role: 'presentation',
  style: {
    touchAction: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  onPointerdown,
}))

const scrubAreaProps = computed(() => mergeProps(defaultProps.value, attrsObject))

provide(numberFieldScrubAreaContextKey, {
  isScrubbing,
  isTouchInput,
  isPointerLockDenied,
  scrubAreaCursorRef,
  scrubAreaRef,
  direction,
  pixelSensitivity,
  teleportDistance,
})

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: scrubAreaProps,
  stateAttributesMapping,
  defaultTagName: 'span',
  ref: scrubAreaRef,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
