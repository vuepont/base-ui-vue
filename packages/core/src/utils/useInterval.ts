import { onUnmounted } from 'vue'

type IntervalId = number

const EMPTY = 0 as IntervalId

export class Interval {
  currentId: IntervalId = EMPTY

  static create() {
    return new Interval()
  }

  /**
   * Repeatedly executes `fn` every `delay` ms, clearing any previously scheduled interval.
   */
  start(delay: number, fn: () => void) {
    this.clear()
    this.currentId = setInterval(fn, delay) as unknown as IntervalId
  }

  isStarted() {
    return this.currentId !== EMPTY
  }

  clear = () => {
    if (this.currentId !== EMPTY) {
      clearInterval(this.currentId)
      this.currentId = EMPTY
    }
  }
}

/**
 * A `setInterval` with automatic cleanup on unmount.
 */
export function useInterval() {
  const interval = Interval.create()

  onUnmounted(() => {
    interval.clear()
  })

  return interval
}
