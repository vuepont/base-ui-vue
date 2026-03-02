import { onUnmounted } from 'vue'

type TimeoutId = number

const EMPTY = 0 as TimeoutId

export class Timeout {
  currentId: TimeoutId = EMPTY

  static create() {
    return new Timeout()
  }

  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  start(delay: number, fn: () => void) {
    this.clear()
    this.currentId = window.setTimeout(() => {
      this.currentId = EMPTY
      fn()
    }, delay)
  }

  isStarted() {
    return this.currentId !== EMPTY
  }

  clear = () => {
    if (this.currentId !== EMPTY) {
      window.clearTimeout(this.currentId)
      this.currentId = EMPTY
    }
  }
}

/**
 * A `setTimeout` with automatic cleanup on unmount.
 */
export function useTimeout() {
  const timeout = Timeout.create()

  onUnmounted(() => {
    timeout.clear()
  })

  return timeout
}
