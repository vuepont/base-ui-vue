import type { MaybeRefOrGetter, Ref } from 'vue'
import { onUnmounted, toValue } from 'vue'
import { ownerWindow } from './owner'
import { useInterval } from './useInterval'
import { useTimeout } from './useTimeout'

const DEFAULT_TICK_DELAY = 60
const DEFAULT_START_DELAY = 400
const DEFAULT_SCROLL_DISTANCE = 8
const TOUCH_TIMEOUT = 50
const MAX_POINTER_MOVES_AFTER_TOUCH = 3

// Treat pen as touch-like to avoid forcing the software keyboard on stylus taps.
function isTouchLikePointerType(pointerType: string) {
  return pointerType === 'touch' || pointerType === 'pen'
}

export interface UsePressAndHoldParameters {
  disabled: MaybeRefOrGetter<boolean>
  readOnly?: MaybeRefOrGetter<boolean>
  /**
   * Called on each tick during a hold. Return `false` to stop the auto-change sequence.
   */
  tick: (triggerEvent?: Event) => boolean
  /**
   * Called when the hold ends via the global `pointerup` event.
   */
  onStop?: (nativeEvent: PointerEvent) => void
  /**
   * Interval between ticks once the hold is active.
   * @default 60
   */
  tickDelay?: number
  /**
   * Delay before the repeating ticks start after the initial hold.
   * @default 400
   */
  startDelay?: number
  /**
   * Pointer movement distance (px) that cancels the hold and is treated as scrolling.
   * @default 8
   */
  scrollDistance?: number
  /**
   * Ref to the anchor element used to resolve `ownerWindow`.
   */
  elementRef: Ref<HTMLElement | null>
}

export interface PressAndHoldPointerHandlers {
  onTouchstart: (event: TouchEvent) => void
  onTouchend: (event: TouchEvent) => void
  onPointerdown: (event: PointerEvent) => void
  onPointerup: (event: PointerEvent) => void
  onPointermove: (event: PointerEvent) => void
  onMouseenter: (event: MouseEvent) => void
  onMouseleave: (event: MouseEvent) => void
  onMouseup: (event: MouseEvent) => void
}

export interface UsePressAndHoldReturnValue {
  pointerHandlers: PressAndHoldPointerHandlers
  /**
   * Returns `true` if the `onClick` handler should be skipped.
   */
  shouldSkipClick: (event: MouseEvent) => boolean
}

/**
 * Adds press-and-hold behavior to a button element.
 * On pointer down, performs one action immediately, then after a delay starts
 * continuous repeated actions at a fixed interval. Handles mouse, touch, and pen inputs.
 */
export function usePressAndHold(params: UsePressAndHoldParameters): UsePressAndHoldReturnValue {
  const {
    tick,
    onStop,
    tickDelay = DEFAULT_TICK_DELAY,
    startDelay = DEFAULT_START_DELAY,
    scrollDistance = DEFAULT_SCROLL_DISTANCE,
    elementRef,
  } = params

  const isDisabled = () => toValue(params.disabled)
  const isReadOnly = () => toValue(params.readOnly ?? false)

  const startTickTimeout = useTimeout()
  const tickInterval = useInterval()
  const intentionalTouchCheckTimeout = useTimeout()

  let isPressed = false
  let movesAfterTouch = 0
  let downCoords = { x: 0, y: 0 }
  let isTouchingButton = false
  let ignoreClick = false
  let pointerType = ''
  let unsubscribeFromGlobalContextMenu: () => void = () => {}

  function stopAutoChange() {
    intentionalTouchCheckTimeout.clear()
    startTickTimeout.clear()
    tickInterval.clear()
    unsubscribeFromGlobalContextMenu()
    unsubscribeFromGlobalContextMenu = () => {}
    movesAfterTouch = 0
  }

  function startAutoChange(triggerNativeEvent?: Event) {
    stopAutoChange()

    const element = elementRef.value
    if (!element) {
      return
    }

    const win = ownerWindow(element)

    function handleContextMenu(event: Event) {
      event.preventDefault()
    }

    // A global context menu listener prevents the context menu from appearing when
    // the touch is slightly outside of the element's hit area.
    win.addEventListener('contextmenu', handleContextMenu)
    unsubscribeFromGlobalContextMenu = () => {
      win.removeEventListener('contextmenu', handleContextMenu)
    }

    function handlePointerUp(event: PointerEvent) {
      isPressed = false
      stopAutoChange()
      onStop?.(event)
    }
    win.addEventListener('pointerup', handlePointerUp, { once: true })

    if (!tick(triggerNativeEvent)) {
      stopAutoChange()
      return
    }

    startTickTimeout.start(startDelay, () => {
      tickInterval.start(tickDelay, () => {
        if (!tick(triggerNativeEvent)) {
          stopAutoChange()
        }
      })
    })
  }

  onUnmounted(() => stopAutoChange())

  const pointerHandlers: PressAndHoldPointerHandlers = {
    onTouchstart() {
      isTouchingButton = true
    },
    onTouchend() {
      isTouchingButton = false
    },
    onPointerdown(event) {
      const isMainButton = !event.button || event.button === 0
      if (event.defaultPrevented || !isMainButton || isDisabled() || isReadOnly()) {
        return
      }

      pointerType = event.pointerType
      ignoreClick = false
      isPressed = true
      downCoords = { x: event.clientX, y: event.clientY }

      const isTouchPointer = isTouchLikePointerType(event.pointerType)

      if (!isTouchPointer) {
        event.preventDefault()
        startAutoChange(event)
      }
      else {
        // Check if the pointerdown was intentional and not the result of a scroll or
        // pinch-zoom. In that case, we don't want to start the auto-change sequence.
        intentionalTouchCheckTimeout.start(TOUCH_TIMEOUT, () => {
          const moves = movesAfterTouch
          movesAfterTouch = 0
          const stillPressed = isPressed
          if (stillPressed && moves < MAX_POINTER_MOVES_AFTER_TOUCH) {
            startAutoChange(event)
            ignoreClick = true
          }
          else {
            ignoreClick = false
            stopAutoChange()
          }
        })
      }
    },
    onPointerup(event) {
      if (isTouchLikePointerType(event.pointerType)) {
        isPressed = false
      }
    },
    onPointermove(event) {
      if (
        isDisabled()
        || isReadOnly()
        || !isTouchLikePointerType(event.pointerType)
        || !isPressed
      ) {
        return
      }

      movesAfterTouch += 1

      const { x, y } = downCoords
      const dx = x - event.clientX
      const dy = y - event.clientY

      if (dx ** 2 + dy ** 2 > scrollDistance ** 2) {
        stopAutoChange()
      }
    },
    onMouseenter(event) {
      if (
        event.defaultPrevented
        || isDisabled()
        || isReadOnly()
        || !isPressed
        || isTouchingButton
        || isTouchLikePointerType(pointerType)
      ) {
        return
      }

      startAutoChange(event)
    },
    onMouseleave() {
      if (isTouchingButton) {
        return
      }

      stopAutoChange()
    },
    onMouseup() {
      if (isTouchingButton) {
        return
      }

      stopAutoChange()
    },
  }

  function shouldSkipClick(event: MouseEvent): boolean {
    if (event.defaultPrevented) {
      return true
    }
    if (isTouchLikePointerType(pointerType)) {
      return ignoreClick
    }
    return event.detail !== 0
  }

  return { pointerHandlers, shouldSkipClick }
}
