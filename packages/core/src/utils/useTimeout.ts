import { onUnmounted } from 'vue'

export class Timeout {
  currentId: number = 0

  static create() {
    return new Timeout()
  }

  start(delay: number, fn: () => void) {
    this.clear()
    this.currentId = window.setTimeout(() => {
      this.currentId = 0
      fn()
    }, delay)
  }

  isStarted() {
    return this.currentId !== 0
  }

  clear = () => {
    if (this.currentId !== 0) {
      window.clearTimeout(this.currentId)
      this.currentId = 0
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
