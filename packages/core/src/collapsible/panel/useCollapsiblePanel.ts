/* eslint-disable node/prefer-global/process */
import type { Ref } from 'vue'
import type { CollapsibleChangeEventDetails } from '../collapsible.types'
import type { AnimationType, Dimensions } from '../root/useCollapsibleRoot'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { createChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import { REASONS } from '../../utils/reasons'
import {
  AnimationFrame,
  useAnimationFrame,
} from '../../utils/useAnimationFrame'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { warn } from '../../utils/warn'
import { CollapsiblePanelDataAttributes } from './CollapsiblePanelDataAttributes'

export interface UseCollapsiblePanelParameters {
  abortControllerRef: Ref<AbortController | null>
  animationTypeRef: Ref<AnimationType>
  /**
   * The height of the panel.
   */
  height: Ref<number | undefined>
  /**
   * Allows the browser’s built-in page search to find and expand the panel contents.
   *
   * Overrides the `keepMounted` prop and uses `hidden="until-found"`
   * to hide the element without removing it from the DOM.
   */
  hiddenUntilFound: boolean
  /**
   * The `id` attribute of the panel.
   */
  id: Ref<string | undefined>
  /**
   * Whether to keep the element in the DOM while the panel is closed.
   * This prop is ignored when `hiddenUntilFound` is used.
   */
  keepMounted: boolean
  /**
   * Whether the collapsible panel is currently mounted.
   */
  mounted: Ref<boolean>
  onOpenChange: (open: boolean, details: CollapsibleChangeEventDetails) => void
  /**
   * Whether the collapsible panel is currently open.
   */
  open: Ref<boolean>
  panelRef: Ref<HTMLElement | null>
  runOnceAnimationsFinish: (
    fn: () => void,
    signal?: AbortSignal | null,
  ) => void
  setDimensions: (dims: Dimensions) => void
  setMounted: (next: boolean) => void
  setOpen: (next: boolean) => void
  setVisible: (next: boolean) => void
  transitionDimensionRef: Ref<'width' | 'height' | null>
  /**
   * The visible state of the panel used to determine the `[hidden]` attribute
   * only when CSS keyframe animations are used.
   */
  visible: Ref<boolean>
  width: Ref<number | undefined>
  externalRef?: Ref<HTMLElement | null>
}

export interface UseCollapsiblePanelReturnValue {
  hidden: Ref<boolean>
  panelRef: ((el: any) => void) | undefined
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

  const endingStyleFrame = useAnimationFrame()

  /**
   * When opening, the `hidden` attribute is removed immediately.
   * When closing, the `hidden` attribute is set after any exit animations runs.
   */
  const hidden = computed(() => {
    if (animationTypeRef.value === 'css-animation') {
      return !visible.value
    }
    return !open.value && !mounted.value
  })

  /**
   * When `keepMounted` is `true` this runs once as soon as it exists in the DOM
   * regardless of initial open state.
   *
   * When `keepMounted` is `false` this runs on every mount, typically every
   * time it opens. If the panel is in the middle of a close transition that is
   * interrupted and re-opens, this won't run as the panel was not unmounted.
   */
  function handlePanelRef(element: HTMLElement | null): void | (() => void) {
    if (!element) {
      return undefined
    }

    if (
      animationTypeRef.value == null
      || transitionDimensionRef.value == null
    ) {
      const panelStyles = getComputedStyle(element)

      const hasAnimation
        = panelStyles.animationName !== 'none'
          && panelStyles.animationName !== ''
      const hasTransition
        = panelStyles.transitionDuration !== '0s'
          && panelStyles.transitionDuration !== ''

      if (hasAnimation && hasTransition) {
        if (process.env.NODE_ENV !== 'production') {
          warn(
            'CSS transitions and CSS animations both detected on Collapsible or Accordion panel.',
            'Only one of either animation type should be used.',
          )
        }
      }
      else if (
        panelStyles.animationName === 'none'
        && panelStyles.transitionDuration !== '0s'
      ) {
        animationTypeRef.value = 'css-transition'
      }
      else if (
        panelStyles.animationName !== 'none'
        && panelStyles.transitionDuration === '0s'
      ) {
        animationTypeRef.value = 'css-animation'
      }
      else {
        animationTypeRef.value = 'none'
      }

      /**
       * We need to know in advance which side is being collapsed when using CSS
       * transitions in order to set the value of width/height to `0px` momentarily.
       * Setting both to `0px` will break layout.
       */
      if (
        element.getAttribute('data-orientation') === 'horizontal' // TODO: type AccordionRootDataAttributes.orientation
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
      setDimensions({
        height: element.scrollHeight,
        width: element.scrollWidth,
      })

      if (shouldCancelInitialOpenTransitionRef.value) {
        element.style.setProperty('transition-duration', '0s')
      }
    }

    let frame = -1
    let nextFrame = -1

    frame = AnimationFrame.request(() => {
      shouldCancelInitialOpenTransitionRef.value = false
      nextFrame = AnimationFrame.request(() => {
        /**
         * This is slightly faster than another RAF and is the earliest
         * opportunity to remove the temporary `transition-duration: 0s` that
         * was applied to cancel opening transitions of initially open panels.
         * https://nolanlawson.com/2018/09/25/accurately-measuring-layout-on-the-web/
         */
        setTimeout(() => {
          element.style.removeProperty('transition-duration')
        })
      })
    })

    return () => {
      AnimationFrame.cancel(frame)
      AnimationFrame.cancel(nextFrame)
    }
  }

  const mergedRef = useMergedRefs(
    externalRef ?? null,
    panelRef,
    handlePanelRef as any,
  )

  // CSS transition open/close logic
  // Use post-flush so panel DOM/ref is available after open state updates.
  watch(
    open,
    (isOpen) => {
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

        /* opening */
        Object.keys(originalLayoutStyles).forEach((key) => {
          panel.style.setProperty(key, 'initial', 'important')
        })

        /**
         * When `:keepMounted="false"` and the panel is initially closed, the very
         * first time it opens (not any subsequent opens) `data-starting-style` is
         * off or missing by a frame so we need to set it manually. Otherwise any
         * CSS properties expected to transition using [data-starting-style] may
         * be mis-timed and appear to be complete skipped.
         */
        if (!shouldCancelInitialOpenTransitionRef.value && !keepMounted) {
          panel.setAttribute(CollapsiblePanelDataAttributes.startingStyle, '')
        }

        setDimensions({ height: panel.scrollHeight, width: panel.scrollWidth })

        const resizeFrame = AnimationFrame.request(() => {
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
          AnimationFrame.cancel(resizeFrame)
        }
      }
      else {
        if (panel.scrollHeight === 0 && panel.scrollWidth === 0) {
          return
        }

        /* closing */
        setDimensions({ height: panel.scrollHeight, width: panel.scrollWidth })

        const abortController = new AbortController()
        abortControllerRef.value = abortController
        const signal = abortController.signal

        let attributeObserver: MutationObserver | null = null
        const endingStyleAttribute = CollapsiblePanelDataAttributes.endingStyle

        // Wait for `[data-ending-style]` to be applied.
        attributeObserver = new MutationObserver((mutationList) => {
          const hasEndingStyle = mutationList.some(
            mutation =>
              mutation.type === 'attributes'
              && mutation.attributeName === endingStyleAttribute,
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

        return () => {
          attributeObserver?.disconnect()
          endingStyleFrame.cancel()
          if (abortControllerRef.value === abortController) {
            abortController.abort()
            abortControllerRef.value = null
          }
        }
      }
    },
    { flush: 'post' },
  )

  // CSS animation open/close logic
  // Keep timing aligned with DOM commit before reading layout values.
  watch(
    open,
    (isOpen) => {
      if (animationTypeRef.value !== 'css-animation') {
        return
      }

      const panel = panelRef.value
      if (!panel) {
        return
      }

      latestAnimationNameRef.value
        = panel.style.animationName || latestAnimationNameRef.value
      panel.style.setProperty('animation-name', 'none')
      setDimensions({ height: panel.scrollHeight, width: panel.scrollWidth })

      if (
        !shouldCancelInitialOpenAnimationRef.value
        && !isBeforeMatchRef.value
      ) {
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
    },
    { flush: 'post' },
  )

  // Cancel initial animation on mount
  onMounted(() => {
    const frame = AnimationFrame.request(() => {
      shouldCancelInitialOpenAnimationRef.value = false
    })
    return () => AnimationFrame.cancel(frame)
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
        const frame = AnimationFrame.request(() => {
          isBeforeMatchRef.value = false
          const nextFrame = AnimationFrame.request(() => {
            setTimeout(() => {
              panel.style.removeProperty('transition-duration')
            })
          })
          return () => AnimationFrame.cancel(nextFrame)
        })
        return () => AnimationFrame.cancel(frame)
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

        /**
         * Set data-starting-style here to persist the closed styles, this is to
         * prevent transitions from starting when the `hidden` attribute changes
         * to `'until-found'` as they could have different `display` properties:
         * https://github.com/tailwindlabs/tailwindcss/pull/14625
         */
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
    endingStyleFrame.cancel()
  })

  return {
    hidden,
    panelRef: mergedRef,
  }
}
