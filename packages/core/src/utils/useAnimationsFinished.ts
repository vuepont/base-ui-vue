import type { MaybeRefOrGetter } from 'vue'
import { nextTick, toValue } from 'vue'
import { resolveRef } from './resolveRef'
import { TransitionStatusDataAttributes } from './stateAttributesMapping'
import { useAnimationFrame } from './useAnimationFrame'

export function useAnimationsFinished(
  elementOrRef: any,
  waitForStartingStyleRemoved: MaybeRefOrGetter<boolean | undefined> = false,
  treatAbortedAsFinished = true,
) {
  const frame = useAnimationFrame()

  return (fnToExecute: () => void, signal: AbortSignal | null = null) => {
    frame.cancel()

    function done() {
      nextTick(() => {
        fnToExecute()
      })
    }

    const resolvedElement = resolveRef(elementOrRef)
    if (resolvedElement == null) {
      return
    }

    if (
      typeof resolvedElement.getAnimations !== 'function'
      || (globalThis as any).BASE_UI_ANIMATIONS_DISABLED
    ) {
      fnToExecute()
    }
    else {
      function execWaitForStartingStyleRemoved() {
        const startingStyleAttribute
          = TransitionStatusDataAttributes.startingStyle

        if (!resolvedElement!.hasAttribute(startingStyleAttribute)) {
          frame.request(exec)
          return
        }

        const attributeObserver = new MutationObserver(() => {
          if (!resolvedElement!.hasAttribute(startingStyleAttribute)) {
            attributeObserver.disconnect()
            exec()
          }
        })

        attributeObserver.observe(resolvedElement!, {
          attributes: true,
          attributeFilter: [startingStyleAttribute],
        })

        signal?.addEventListener(
          'abort',
          () => attributeObserver.disconnect(),
          { once: true },
        )
      }

      function exec() {
        Promise.all(
          resolvedElement!.getAnimations().map(anim => anim.finished),
        )
          .then(() => {
            if (signal?.aborted) {
              return
            }
            done()
          })
          .catch(() => {
            const currentAnimations = resolvedElement!.getAnimations()

            if (treatAbortedAsFinished) {
              if (signal?.aborted) {
                return
              }
              done()
            }
            else if (
              currentAnimations.length > 0
              && currentAnimations.some(
                anim => anim.pending || anim.playState !== 'finished',
              )
            ) {
              exec()
            }
          })
      }

      if (toValue(waitForStartingStyleRemoved)) {
        execWaitForStartingStyleRemoved()
        return
      }

      frame.request(exec)
    }
  }
}
