/* eslint-disable node/prefer-global/process */
import { onUnmounted } from 'vue'

type AnimationFrameId = number

const EMPTY = null

let LAST_RAF = typeof window !== 'undefined' ? window.requestAnimationFrame : undefined

class Scheduler {
  callbacks = [] as (FrameRequestCallback | null)[]
  callbacksCount = 0
  nextId = 1
  startId = 1
  isScheduled = false

  tick = (timestamp: number) => {
    this.isScheduled = false

    const currentCallbacks = this.callbacks
    const currentCallbacksCount = this.callbacksCount

    this.callbacks = []
    this.callbacksCount = 0
    this.startId = this.nextId

    if (currentCallbacksCount > 0) {
      for (let i = 0; i < currentCallbacks.length; i += 1) {
        currentCallbacks[i]?.(timestamp)
      }
    }
  }

  request(fn: FrameRequestCallback) {
    if (typeof window === 'undefined')
      return 0

    const id = this.nextId
    this.nextId += 1
    this.callbacks.push(fn)
    this.callbacksCount += 1

    const didRAFChange
      = process.env.NODE_ENV !== 'production'
        && LAST_RAF !== window.requestAnimationFrame
        && ((LAST_RAF = window.requestAnimationFrame), true)

    if (!this.isScheduled || didRAFChange) {
      window.requestAnimationFrame(this.tick)
      this.isScheduled = true
    }
    return id
  }

  cancel(id: AnimationFrameId) {
    const index = id - this.startId
    if (index < 0 || index >= this.callbacks.length) {
      return
    }
    this.callbacks[index] = null
    this.callbacksCount -= 1
  }
}

const scheduler = new Scheduler()

export class AnimationFrame {
  static create() {
    return new AnimationFrame()
  }

  static request(fn: FrameRequestCallback) {
    return scheduler.request(fn)
  }

  static cancel(id: AnimationFrameId) {
    return scheduler.cancel(id)
  }

  currentId: AnimationFrameId | null = EMPTY

  request(fn: FrameRequestCallback) {
    this.cancel()
    this.currentId = scheduler.request((timestamp) => {
      this.currentId = EMPTY
      fn(timestamp)
    })
  }

  cancel = () => {
    if (this.currentId !== EMPTY) {
      scheduler.cancel(this.currentId)
      this.currentId = EMPTY
    }
  }
}

export function useAnimationFrame() {
  const animationFrame = AnimationFrame.create()

  onUnmounted(() => {
    animationFrame.cancel()
  })

  return animationFrame
}
