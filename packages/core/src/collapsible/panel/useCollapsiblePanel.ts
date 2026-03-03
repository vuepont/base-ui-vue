/* eslint-disable node/prefer-global/process */
import type { Ref } from 'vue'
import type { CollapsibleChangeEventDetails } from '../collapsible.types'
import type { AnimationType, Dimensions } from '../root/CollapsibleRootContext'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { createChangeEventDetails } from '../../utils/createChangeEventDetails'
import { error } from '../../utils/error'
import { REASONS } from '../../utils/reasons'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { CollapsiblePanelDataAttributes } from './CollapsiblePanelDataAttributes'

export interface UseCollapsiblePanelParameters {
  abortControllerRef: Ref<AbortController | null>
  animationTypeRef: Ref<AnimationType>
  height: Ref<number | undefined>
  hiddenUntilFound: boolean
  id: Ref<string | undefined>
  keepMounted: boolean
  mounted: Ref<boolean>
  onOpenChange: (open: boolean, details: CollapsibleChangeEventDetails) => void
  open: Ref<boolean>
  panelRef: Ref<HTMLElement | null>
  runOnceAnimationsFinish: (fn: () => void, signal?: AbortSignal | null) => void
  setDimensions: (dims: Dimensions) => void
  setMounted: (next: boolean) => void
  setOpen: (next: boolean) => void
  setVisible: (next: boolean) => void
  transitionDimensionRef: Ref<'width' | 'height' | null>
  visible: Ref<boolean>
  width: Ref<number | undefined>
  externalRef?: Ref<HTMLElement | null>
}

export interface UseCollapsiblePanelReturnValue {
  hidden: Ref<boolean>
  panelRef: ((el: any) => void) | null
}

export function useCollapsiblePanel(
  parameters: UseCollapsiblePanelParameters,
): UseCollapsiblePanelReturnValue {
  const {
    abortControllerRef,
    animationTypeRef,
    height,
    hiddenUntilFound,
    keepMounted,
    mounted,
    onOpenChange,
    open,
    panelRef,
    runOnceAnimationsFinish,
    setDimensions,
    setMounted,
    setOpen,
    setVisible,
    transitionDimensionRef,
    visible,
    width,
    externalRef,
  } = parameters

  const isBeforeMatchRef = ref(false)
  const latestAnimationNameRef = ref<string | null>(null)
  const shouldCancelInitialOpenAnimationRef = ref(open.value)
  const shouldCancelInitialOpenTransitionRef = ref(open.value)

  const endingStyleFrame: number | null = null

  const hidden = computed(() => {
    if (animationTypeRef.value === 'css-animation') {
      return !visible.value
    }
    return !open.value && !mounted.value
  })

  function handlePanelRef(element: HTMLElement | null): void | (() => void) {
    if (!element) {
      return undefined
    }

    if (animationTypeRef.value == null || transitionDimensionRef.value == null) {
      const panelStyles = getComputedStyle(element)

      const hasAnimation = panelStyles.animationName !== 'none' && panelStyles.animationName !== ''
      const hasTransition
        = panelStyles.transitionDuration !== '0s' && panelStyles.transitionDuration !== ''

      if (hasAnimation && hasTransition) {
        if (process.env.NODE_ENV !== 'production') {
          error(
            'CSS transitions and CSS animations both detected on Collapsible or Accordion panel.',
            'Only one of either animation type should be used.',
          )
        }
      }
      else if (panelStyles.animationName === 'none' && panelStyles.transitionDuration !== '0s') {
        animationTypeRef.value = 'css-transition'
      }
      else if (panelStyles.animationName !== 'none' && panelStyles.transitionDuration === '0s') {
        animationTypeRef.value = 'css-animation'
      }
      else {
        animationTypeRef.value = 'none'
      }

      if (
        element.getAttribute('data-orientation') === 'horizontal'
        || panelStyles.transitionProperty.includes('width')
      ) {
        transitionDimensionRef.value = 'width'
      }
      else {
        transitionDimensionRef.value = 'height'
      }
    }

    if (animationTypeRef.value !== 'css-transition') {
      return undefined
    }

    if (height.value === undefined || width.value === undefined) {
      setDimensions({ height: element.scrollHeight, width: element.scrollWidth })

      if (shouldCancelInitialOpenTransitionRef.value) {
        element.style.setProperty('transition-duration', '0s')
      }
    }

    let frame = -1
    let nextFrame = -1

    frame = requestAnimationFrame(() => {
      shouldCancelInitialOpenTransitionRef.value = false
      nextFrame = requestAnimationFrame(() => {
        setTimeout(() => {
          element.style.removeProperty('transition-duration')
        })
      })
    })

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(nextFrame)
    }
  }

  const mergedRef = useMergedRefs(externalRef ?? null, panelRef, handlePanelRef as any)

  // CSS transition open/close logic
  // Use post-flush so panel DOM/ref is available after open state updates.
  watch(open, (isOpen) => {
    if (animationTypeRef.value !== 'css-transition') {
      return
    }

    const panel = panelRef.value
    if (!panel) {
      return
    }

    if (abortControllerRef.value != null) {
      abortControllerRef.value.abort()
      abortControllerRef.value = null
    }

    if (isOpen) {
      const originalLayoutStyles: Record<string, string> = {
        'justify-content': panel.style.justifyContent,
        'align-items': panel.style.alignItems,
        'align-content': panel.style.alignContent,
        'justify-items': panel.style.justifyItems,
      }

      Object.keys(originalLayoutStyles).forEach((key) => {
        panel.style.setProperty(key, 'initial', 'important')
      })

      if (!shouldCancelInitialOpenTransitionRef.value && !keepMounted) {
        panel.setAttribute(CollapsiblePanelDataAttributes.startingStyle, '')
      }

      setDimensions({ height: panel.scrollHeight, width: panel.scrollWidth })

      const resizeFrame = requestAnimationFrame(() => {
        Object.entries(originalLayoutStyles).forEach(([key, value]) => {
          if (value === '') {
            panel.style.removeProperty(key)
          }
          else {
            panel.style.setProperty(key, value)
          }
        })
      })

      return () => {
        cancelAnimationFrame(resizeFrame)
      }
    }
    else {
      if (panel.scrollHeight === 0 && panel.scrollWidth === 0) {
        return
      }

      setDimensions({ height: panel.scrollHeight, width: panel.scrollWidth })

      const abortController = new AbortController()
      abortControllerRef.value = abortController
      const signal = abortController.signal

      let attributeObserver: MutationObserver | null = null
      const endingStyleAttribute = CollapsiblePanelDataAttributes.endingStyle

      attributeObserver = new MutationObserver((mutationList) => {
        const hasEndingStyle = mutationList.some(
          mutation =>
            mutation.type === 'attributes' && mutation.attributeName === endingStyleAttribute,
        )

        if (hasEndingStyle) {
          attributeObserver?.disconnect()
          attributeObserver = null
          runOnceAnimationsFinish(() => {
            setDimensions({ height: 0, width: 0 })
            panel.style.removeProperty('content-visibility')
            setMounted(false)
            if (abortControllerRef.value === abortController) {
              abortControllerRef.value = null
            }
          }, signal)
        }
      })

      attributeObserver.observe(panel, {
        attributes: true,
        attributeFilter: [endingStyleAttribute],
      })
    }
  }, { flush: 'post' })

  // CSS animation open/close logic
  // Keep timing aligned with DOM commit before reading layout values.
  watch(open, (isOpen) => {
    if (animationTypeRef.value !== 'css-animation') {
      return
    }

    const panel = panelRef.value
    if (!panel) {
      return
    }

    latestAnimationNameRef.value = panel.style.animationName || latestAnimationNameRef.value
    panel.style.setProperty('animation-name', 'none')
    setDimensions({ height: panel.scrollHeight, width: panel.scrollWidth })

    if (!shouldCancelInitialOpenAnimationRef.value && !isBeforeMatchRef.value) {
      panel.style.removeProperty('animation-name')
    }

    if (isOpen) {
      if (abortControllerRef.value != null) {
        abortControllerRef.value.abort()
        abortControllerRef.value = null
      }
      setMounted(true)
      setVisible(true)
    }
    else {
      abortControllerRef.value = new AbortController()
      runOnceAnimationsFinish(() => {
        setMounted(false)
        setVisible(false)
        abortControllerRef.value = null
      }, abortControllerRef.value.signal)
    }
  }, { flush: 'post' })

  // Cancel initial animation on mount
  onMounted(() => {
    const frame = requestAnimationFrame(() => {
      shouldCancelInitialOpenAnimationRef.value = false
    })
    return () => cancelAnimationFrame(frame)
  })

  // hiddenUntilFound: beforematch transition timing
  watch(
    [open, () => hiddenUntilFound] as const,
    ([isOpen]) => {
      if (!hiddenUntilFound)
        return

      const panel = panelRef.value
      if (!panel)
        return

      if (isOpen && isBeforeMatchRef.value) {
        panel.style.transitionDuration = '0s'
        setDimensions({ height: panel.scrollHeight, width: panel.scrollWidth })
        const frame = requestAnimationFrame(() => {
          isBeforeMatchRef.value = false
          const nextFrame = requestAnimationFrame(() => {
            setTimeout(() => {
              panel.style.removeProperty('transition-duration')
            })
          })
          return () => cancelAnimationFrame(nextFrame)
        })
        return () => cancelAnimationFrame(frame)
      }
    },
    { flush: 'sync' },
  )

  // hiddenUntilFound: set hidden="until-found" attribute
  watch(
    [hidden, () => hiddenUntilFound] as const,
    ([isHidden]) => {
      const panel = panelRef.value
      if (!panel || !hiddenUntilFound) {
        return
      }

      if (isHidden) {
        panel.setAttribute('hidden', 'until-found')
        if (animationTypeRef.value === 'css-transition') {
          panel.setAttribute(CollapsiblePanelDataAttributes.startingStyle, '')
        }
      }
      else {
        panel.removeAttribute('hidden')
      }
    },
    { flush: 'post' },
  )

  // hiddenUntilFound: beforematch event listener
  let beforeMatchCleanup: (() => void) | null = null

  function setupBeforeMatchListener() {
    beforeMatchCleanup?.()
    beforeMatchCleanup = null

    const panel = panelRef.value
    if (!panel)
      return

    function handleBeforeMatch(event: Event) {
      isBeforeMatchRef.value = true
      setOpen(true)
      onOpenChange(true, createChangeEventDetails(REASONS.none, event))
    }

    panel.addEventListener('beforematch', handleBeforeMatch)
    beforeMatchCleanup = () => {
      panel.removeEventListener('beforematch', handleBeforeMatch)
    }
  }

  watch(panelRef, () => setupBeforeMatchListener(), { flush: 'post' })
  onMounted(setupBeforeMatchListener)
  onUnmounted(() => {
    beforeMatchCleanup?.()
    if (endingStyleFrame != null) {
      cancelAnimationFrame(endingStyleFrame)
    }
  })

  return {
    hidden,
    panelRef: mergedRef,
  }
}
