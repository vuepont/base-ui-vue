import type { BaseUIChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import type { FloatingTriggerMap } from '../types'
import type { UseDismissProps } from './useDismiss'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, shallowRef } from 'vue'
import { REASONS } from '../../utils/reasons'
import { createFloatingRootContext } from '../components/FloatingRootStore'
import { normalizeProp, useDismiss } from './useDismiss'

function createTriggerMap(reference: { value: HTMLElement | null }): FloatingTriggerMap {
  return {
    hasElement(element) {
      return reference.value === element
    },
    hasMatchingElement(predicate) {
      return reference.value ? predicate(reference.value) : false
    },
    getById(id) {
      return id === 'reference' ? reference.value ?? undefined : undefined
    },
    entries() {
      const entries = reference.value
        ? [['reference', reference.value] as [string, HTMLElement]]
        : []

      return entries[Symbol.iterator]()
    },
    elements() {
      const elements = reference.value ? [reference.value] : []
      return elements[Symbol.iterator]()
    },
    get size() {
      return reference.value ? 1 : 0
    },
  }
}

function renderDismissApp(
  dismissProps: UseDismissProps = {},
  options: {
    cancelClose?: boolean
    includePreventedPressStart?: boolean
    onOpenChange?: (open: boolean, details: BaseUIChangeEventDetails<string, any>) => void
  } = {},
) {
  const open = shallowRef(true)
  const lastDetails = shallowRef<BaseUIChangeEventDetails<string, any> | null>(null)

  render(defineComponent({
    setup() {
      const reference = shallowRef<HTMLElement | null>(null)
      const floating = shallowRef<HTMLElement | null>(null)
      const transitionStatus = shallowRef<'idle'>('idle')
      const triggerElements = createTriggerMap(reference)

      const context = createFloatingRootContext({
        open,
        transitionStatus,
        domReferenceElement: () => reference.value,
        referenceElement: () => reference.value,
        floatingElement: () => floating.value,
        floatingId: () => 'tooltip',
        triggerElements,
        onOpenChange(nextOpen, details) {
          lastDetails.value = details
          options.onOpenChange?.(nextOpen, details)

          if (options.cancelClose && !nextOpen) {
            details.cancel()
          }

          if (!details.isCanceled) {
            open.value = nextOpen
          }
        },
      })

      const dismiss = useDismiss(context, dismissProps)

      function preventInsidePointerDown(event: PointerEvent) {
        if (options.includePreventedPressStart) {
          event.preventDefault()
        }
      }

      return {
        dismiss,
        floating,
        open,
        preventInsidePointerDown,
        reference,
      }
    },
    template: `
      <button ref="reference" v-bind="dismiss.reference">Reference</button>
      <div v-if="open" ref="floating" role="tooltip" v-bind="dismiss.floating">
        <input aria-label="input" />
        <div data-testid="scrubber" @pointerdown="preventInsidePointerDown" />
      </div>
    `,
  }))

  return {
    lastDetails,
    open,
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('useDismiss', () => {
  describe('default options', () => {
    it('dismisses with escape key', async () => {
      renderDismissApp()

      fireEvent.keyDown(document.body, { key: 'Escape' })
      await nextTick()

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('calls preventDefault on escape key dismiss', async () => {
      renderDismissApp()

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      })

      document.body.dispatchEvent(event)
      await nextTick()

      expect(event.defaultPrevented).toBe(true)
    })

    it('does not call preventDefault on escape key if close is canceled', async () => {
      renderDismissApp({}, { cancelClose: true })

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      })

      document.body.dispatchEvent(event)
      await nextTick()

      expect(event.defaultPrevented).toBe(false)
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    it('does not dismiss with escape key if IME is active', async () => {
      vi.useFakeTimers()
      const onOpenChange = vi.fn()
      renderDismissApp({ escapeKey: true }, { onOpenChange })

      const textbox = screen.getByRole('textbox')
      await fireEvent.focus(textbox)

      fireEvent.compositionStart(textbox)
      fireEvent.keyDown(textbox, { key: 'Escape' })
      fireEvent.compositionEnd(textbox)

      vi.advanceTimersByTime(0)
      await nextTick()

      expect(onOpenChange).not.toHaveBeenCalled()
      expect(screen.getByRole('tooltip')).toBeInTheDocument()

      fireEvent.keyDown(textbox, { key: 'Escape' })
      await nextTick()

      expect(onOpenChange).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('dismisses with outside pointer press', async () => {
      const user = userEvent.setup()
      const { lastDetails } = renderDismissApp()

      await user.click(document.body)
      await nextTick()

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
      expect(lastDetails.value?.reason).toBe(REASONS.outsidePress)
    })

    it('dismisses with reference press', async () => {
      const { lastDetails } = renderDismissApp({ referencePress: () => true })

      await fireEvent.pointerDown(screen.getByRole('button'))
      await nextTick()

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
      expect(lastDetails.value?.reason).toBe(REASONS.triggerPress)
    })

    it('dismisses with native click', async () => {
      const { lastDetails } = renderDismissApp({ referencePress: () => true })

      await fireEvent.click(screen.getByRole('button'))
      await nextTick()

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
      expect(lastDetails.value?.reason).toBe(REASONS.triggerPress)
    })

    it('outsidePress function guard', async () => {
      const user = userEvent.setup()
      renderDismissApp({ outsidePress: () => false })

      await user.click(document.body)
      await nextTick()

      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
  })

  describe('prop: bubbles', () => {
    it('when undefined', () => {
      const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } = normalizeProp()

      expect(escapeKeyBubbles).toBe(false)
      expect(outsidePressBubbles).toBe(true)
    })

    it('when true', () => {
      const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } = normalizeProp(true)

      expect(escapeKeyBubbles).toBe(true)
      expect(outsidePressBubbles).toBe(true)
    })

    it('when false', () => {
      const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } = normalizeProp(false)

      expect(escapeKeyBubbles).toBe(false)
      expect(outsidePressBubbles).toBe(false)
    })

    it('{}', () => {
      const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } = normalizeProp({})

      expect(escapeKeyBubbles).toBe(false)
      expect(outsidePressBubbles).toBe(true)
    })

    it('{ escapeKey: false }', () => {
      const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } = normalizeProp({
        escapeKey: false,
      })

      expect(escapeKeyBubbles).toBe(false)
      expect(outsidePressBubbles).toBe(true)
    })

    it('{ outsidePress: false }', () => {
      const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } = normalizeProp({
        outsidePress: false,
      })

      expect(escapeKeyBubbles).toBe(false)
      expect(outsidePressBubbles).toBe(false)
    })
  })

  describe('outsidePressEvent: nullish resolver', () => {
    it.each([null, undefined] as const)(
      'falls back to sloppy when resolver returns %s',
      async (resolvedEvent) => {
        const outsidePressEvent = (() => resolvedEvent) as unknown as UseDismissProps['outsidePressEvent']
        const { lastDetails } = renderDismissApp({ outsidePressEvent })

        fireEvent.click(document.body)
        await nextTick()

        expect(screen.getByRole('tooltip')).toBeInTheDocument()

        fireEvent.pointerDown(document.body, { pointerType: 'mouse', button: 0 })
        await nextTick()

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
        expect(lastDetails.value?.reason).toBe(REASONS.outsidePress)
      },
    )
  })

  describe('outsidePressEvent: intentional', () => {
    it('dragging outside the floating element does not close', async () => {
      renderDismissApp({ outsidePressEvent: 'intentional' })
      const floatingEl = screen.getByRole('tooltip')

      fireEvent.mouseDown(floatingEl)
      fireEvent.mouseUp(document.body)
      await nextTick()

      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    it('dragging outside the floating element then clicking outside closes', async () => {
      renderDismissApp({ outsidePressEvent: 'intentional' })
      const floatingEl = screen.getByRole('tooltip')

      fireEvent.mouseDown(floatingEl)
      fireEvent.mouseUp(document.body)
      fireEvent.click(document.body)
      fireEvent.click(document.body)
      await nextTick()

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('inside click then programmatic outside click closes', async () => {
      renderDismissApp({ outsidePressEvent: 'intentional' })
      const insideInput = screen.getByRole('textbox')

      fireEvent.mouseDown(insideInput)
      fireEvent.mouseUp(insideInput)
      fireEvent.click(insideInput)
      await nextTick()

      expect(screen.getByRole('tooltip')).toBeInTheDocument()

      fireEvent.click(document.body)
      await nextTick()

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('press start prevented inside suppresses only immediate outside click', async () => {
      vi.useFakeTimers()
      renderDismissApp(
        { outsidePressEvent: 'intentional' },
        { includePreventedPressStart: true },
      )
      const scrubber = screen.getByTestId('scrubber')

      fireEvent.pointerDown(scrubber, { pointerType: 'mouse', button: 0 })
      fireEvent.mouseDown(scrubber, { button: 0 })
      fireEvent.pointerUp(document.body, { pointerType: 'mouse', button: 0 })
      fireEvent.mouseUp(document.body, { button: 0 })

      fireEvent.click(document.body)
      await nextTick()

      expect(screen.getByRole('tooltip')).toBeInTheDocument()

      vi.advanceTimersByTime(0)

      fireEvent.click(document.body)
      await nextTick()

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })
})
