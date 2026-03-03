import type { Ref } from 'vue'
import type { CollapsibleChangeEventDetails, CollapsibleRootState } from '../collapsible.types'
import type { AnimationType, CollapsibleRootContext, Dimensions } from './CollapsibleRootContext'
import { computed, ref, shallowRef, watch } from 'vue'
import { createChangeEventDetails } from '../../utils/createChangeEventDetails'
import { REASONS } from '../../utils/reasons'
import { useAnimationsFinished } from '../../utils/useAnimationsFinished'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useControllableState } from '../../utils/useControllableState'
import { useTransitionStatus } from '../../utils/useTransitionStatus'

export interface UseCollapsibleRootParameters {
  open?: () => boolean | undefined
  isOpenControlled?: () => boolean
  defaultOpen?: boolean
  onOpenChange: (open: boolean, details: CollapsibleChangeEventDetails) => void
  disabled: () => boolean
}

export function useCollapsibleRoot(
  parameters: UseCollapsibleRootParameters,
): CollapsibleRootContext {
  const { open: openParam, defaultOpen = false, onOpenChange, disabled: disabledGetter } = parameters

  const isControlled = computed(() => {
    if (parameters.isOpenControlled) {
      return parameters.isOpenControlled()
    }
    return openParam?.() !== undefined
  })

  const { value: open, setValue: setOpen } = useControllableState<boolean>({
    controlled: () => (isControlled.value ? openParam?.() : undefined),
    default: defaultOpen,
  })

  const { mounted, setMounted, transitionStatus } = useTransitionStatus(
    open as Ref<boolean>,
    true,
    true,
  )
  const visible = ref(open.value)
  const height = ref<number | undefined>(undefined)
  const width = ref<number | undefined>(undefined)

  const defaultPanelId = useBaseUiId()
  const panelIdState = ref<string | undefined>(undefined)
  const panelId = computed(() => panelIdState.value ?? defaultPanelId)

  const hiddenUntilFound = ref(false)
  const keepMounted = ref(false)

  const abortControllerRef = shallowRef<AbortController | null>(null)
  const animationTypeRef = ref<AnimationType>(null)
  const transitionDimensionRef = ref<'width' | 'height' | null>(null)
  const panelRef = ref<HTMLElement | null>(null)

  const runOnceAnimationsFinish = useAnimationsFinished(panelRef, false)

  const disabled = computed(() => disabledGetter())

  function handleTrigger(event: MouseEvent | KeyboardEvent) {
    if (disabled.value) {
      return
    }

    const nextOpen = !open.value
    const eventDetails = createChangeEventDetails(REASONS.triggerPress, event)

    onOpenChange(nextOpen, eventDetails)

    if (eventDetails.isCanceled) {
      return
    }

    const panel = panelRef.value

    if (nextOpen && !mounted.value) {
      // Ensure first open always mounts panel immediately.
      setMounted(true)
    }

    if (animationTypeRef.value === 'css-animation' && panel != null) {
      panel.style.removeProperty('animation-name')
    }

    if (!hiddenUntilFound.value && !keepMounted.value) {
      if (animationTypeRef.value != null && animationTypeRef.value !== 'css-animation') {
        if (!mounted.value && nextOpen) {
          setMounted(true)
        }
      }

      if (animationTypeRef.value === 'css-animation') {
        if (!visible.value && nextOpen) {
          visible.value = true
        }
        if (!mounted.value && nextOpen) {
          setMounted(true)
        }
      }
    }

    setOpen(nextOpen)

    if (animationTypeRef.value === 'none' && mounted.value && !nextOpen) {
      setMounted(false)
    }
  }

  // Unmount immediately for controlled mode with no animations
  watch(open, (isOpen) => {
    if (isControlled.value && animationTypeRef.value === 'none' && !keepMounted.value && !isOpen) {
      setMounted(false)
    }
  }, { flush: 'sync' })

  const state = computed<CollapsibleRootState>(() => ({
    open: open.value,
    disabled: disabled.value,
    transitionStatus: transitionStatus.value,
  }))

  return {
    open: open as Ref<boolean>,
    disabled,
    panelId,
    state,
    handleTrigger,
    mounted,
    setMounted,
    transitionStatus,
    height,
    width,
    setDimensions(dims: Dimensions) {
      height.value = dims.height
      width.value = dims.width
    },
    setOpen,
    visible,
    setVisible(next: boolean) {
      visible.value = next
    },
    keepMounted,
    setKeepMounted(next: boolean) {
      keepMounted.value = next
    },
    hiddenUntilFound,
    setHiddenUntilFound(next: boolean) {
      hiddenUntilFound.value = next
    },
    setPanelId(id: string | undefined) {
      panelIdState.value = id
    },
    animationTypeRef,
    panelRef,
    abortControllerRef,
    transitionDimensionRef,
    runOnceAnimationsFinish,
    onOpenChange,
  }
}
