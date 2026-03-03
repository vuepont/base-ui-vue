import type { Ref } from 'vue'

/**
 * Resolves a DOM element from a ref or direct element reference.
 */
function resolveElement(
  elementOrRef: Ref<HTMLElement | null> | HTMLElement | null,
): HTMLElement | null {
  if (elementOrRef == null)
    return null
  if (typeof elementOrRef === 'object' && 'value' in elementOrRef) {
    return elementOrRef.value
  }
  return elementOrRef
}

/**
 * Returns a function that executes a callback once all CSS animations/transitions
 * have finished on the provided element.
 *
 * Port of React Base UI's `useAnimationsFinished`.
 */
export function useAnimationsFinished(
  elementOrRef: Ref<HTMLElement | null> | HTMLElement | null,
  waitForStartingStyleRemoved = false,
  treatAbortedAsFinished = true,
) {
  let pendingFrame: number | null = null

  return (
    fnToExecute: () => void,
    signal: AbortSignal | null = null,
  ) => {
    if (pendingFrame != null) {
      cancelAnimationFrame(pendingFrame)
      pendingFrame = null
    }

    const element = resolveElement(elementOrRef)
    if (element == null) {
      return
    }

    if (
      typeof element.getAnimations !== 'function'
      || (globalThis as any).BASE_UI_ANIMATIONS_DISABLED
    ) {
      fnToExecute()
      return
    }

    const resolvedElement = element

    function execWaitForStartingStyleRemoved() {
      const attr = 'data-starting-style'

      if (!resolvedElement.hasAttribute(attr)) {
        pendingFrame = requestAnimationFrame(exec)
        return
      }

      const observer = new MutationObserver(() => {
        if (!resolvedElement.hasAttribute(attr)) {
          observer.disconnect()
          exec()
        }
      })

      observer.observe(resolvedElement, {
        attributes: true,
        attributeFilter: [attr],
      })

      signal?.addEventListener('abort', () => observer.disconnect(), { once: true })
    }

    function exec() {
      Promise.all(resolvedElement.getAnimations().map(anim => anim.finished))
        .then(() => {
          if (signal?.aborted)
            return
          fnToExecute()
        })
        .catch(() => {
          const currentAnimations = resolvedElement.getAnimations()

          if (treatAbortedAsFinished) {
            if (signal?.aborted)
              return
            fnToExecute()
          }
          else if (
            currentAnimations.length > 0
            && currentAnimations.some(anim => anim.pending || anim.playState !== 'finished')
          ) {
            exec()
          }
        })
    }

    if (waitForStartingStyleRemoved) {
      execWaitForStartingStyleRemoved()
      return
    }

    pendingFrame = requestAnimationFrame(exec)
  }
}
