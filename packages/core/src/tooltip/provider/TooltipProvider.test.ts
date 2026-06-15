import { fireEvent, render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import TooltipPopup from '../popup/TooltipPopup.vue'
import TooltipPortal from '../portal/TooltipPortal.vue'
import TooltipPositioner from '../positioner/TooltipPositioner.vue'
import TooltipRoot from '../root/TooltipRoot.vue'
import TooltipTrigger from '../trigger/TooltipTrigger.vue'
import { OPEN_DELAY } from '../utils/constants'
import TooltipProvider from './TooltipProvider.vue'

const CONTENT = 'Content'

afterEach(() => {
  vi.useRealTimers()
})

function renderProviderTooltip(options: {
  delay?: number
  closeDelay?: number
  triggerDelay?: number
  closeDelayRef?: ReturnType<typeof ref<number>>
} = {}) {
  return render(defineComponent({
    components: {
      TooltipPopup,
      TooltipPortal,
      TooltipPositioner,
      TooltipProvider,
      TooltipRoot,
      TooltipTrigger,
    },
    setup() {
      const closeDelay = options.closeDelayRef ?? ref(options.closeDelay)

      return {
        closeDelay,
        delay: options.delay,
        triggerDelay: options.triggerDelay,
      }
    },
    template: `
      <TooltipProvider :delay="delay" :close-delay="closeDelay">
        <TooltipRoot>
          <TooltipTrigger :delay="triggerDelay" />
          <TooltipPortal>
            <TooltipPositioner>
              <TooltipPopup>${CONTENT}</TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      </TooltipProvider>
    `,
  }))
}

describe('<Tooltip.Provider />', () => {
  describe('prop: delay', () => {
    it('waits for the delay before showing the tooltip', async () => {
      vi.useFakeTimers()
      renderProviderTooltip({ delay: 10_000 })

      const trigger = screen.getByRole('button')

      await fireEvent.mouseEnter(trigger)

      expect(screen.queryByText(CONTENT)).toBeNull()

      vi.advanceTimersByTime(1_000)
      await nextTick()

      expect(screen.queryByText(CONTENT)).toBeNull()

      vi.advanceTimersByTime(9_000)
      await nextTick()

      expect(screen.queryByText(CONTENT)).not.toBeNull()
    })

    it('respects delay=0', async () => {
      vi.useFakeTimers()
      renderProviderTooltip({ delay: 0 })

      const trigger = screen.getByRole('button')

      await fireEvent.mouseEnter(trigger)
      vi.advanceTimersByTime(0)
      await nextTick()

      expect(screen.queryByText(CONTENT)).not.toBeNull()
    })

    it('respects trigger delay prop over provider delay prop', async () => {
      vi.useFakeTimers()
      renderProviderTooltip({ delay: 10, triggerDelay: 100 })

      const trigger = screen.getByRole('button')

      await fireEvent.mouseEnter(trigger)

      expect(screen.queryByText(CONTENT)).toBeNull()

      vi.advanceTimersByTime(99)
      await nextTick()

      expect(screen.queryByText(CONTENT)).toBeNull()

      vi.advanceTimersByTime(1)
      await nextTick()

      expect(screen.queryByText(CONTENT)).not.toBeNull()
    })
  })

  describe('prop: closeDelay', () => {
    it('waits for the closeDelay before hiding the tooltip', async () => {
      vi.useFakeTimers()
      renderProviderTooltip({ closeDelay: 400 })

      const trigger = screen.getByRole('button')

      await fireEvent.mouseEnter(trigger)
      vi.advanceTimersByTime(OPEN_DELAY)
      await nextTick()

      expect(screen.queryByText(CONTENT)).not.toBeNull()

      await fireEvent.mouseLeave(trigger)

      vi.advanceTimersByTime(300)
      await nextTick()

      expect(screen.queryByText(CONTENT)).not.toBeNull()

      vi.advanceTimersByTime(300)
      await nextTick()

      expect(screen.queryByText(CONTENT)).toBeNull()
    })

    it('uses the latest closeDelay after the prop updates', async () => {
      vi.useFakeTimers()
      const closeDelay = ref(400)
      renderProviderTooltip({ closeDelayRef: closeDelay })

      const trigger = screen.getByRole('button')

      await fireEvent.mouseEnter(trigger)
      vi.advanceTimersByTime(OPEN_DELAY)
      await nextTick()

      expect(screen.queryByText(CONTENT)).not.toBeNull()

      closeDelay.value = 1000
      await nextTick()

      await fireEvent.mouseLeave(trigger)

      vi.advanceTimersByTime(999)
      await nextTick()

      expect(screen.queryByText(CONTENT)).not.toBeNull()

      vi.advanceTimersByTime(1)
      await nextTick()

      expect(screen.queryByText(CONTENT)).toBeNull()
    })
  })

  it('opens adjacent tooltip instantly within the timeout', async () => {
    vi.useFakeTimers()

    render(defineComponent({
      components: {
        TooltipPopup,
        TooltipPortal,
        TooltipPositioner,
        TooltipProvider,
        TooltipRoot,
        TooltipTrigger,
      },
      template: `
        <TooltipProvider :delay="600" :timeout="400">
          <TooltipRoot disable-hoverable-popup>
            <TooltipTrigger>First</TooltipTrigger>
            <TooltipPortal disabled>
              <TooltipPositioner>
                <TooltipPopup>First content</TooltipPopup>
              </TooltipPositioner>
            </TooltipPortal>
          </TooltipRoot>
          <TooltipRoot disable-hoverable-popup>
            <TooltipTrigger>Second</TooltipTrigger>
            <TooltipPortal disabled>
              <TooltipPositioner>
                <TooltipPopup>Second content</TooltipPopup>
              </TooltipPositioner>
            </TooltipPortal>
          </TooltipRoot>
        </TooltipProvider>
      `,
    }))

    const first = screen.getByRole('button', { name: 'First' })
    const second = screen.getByRole('button', { name: 'Second' })

    await fireEvent.mouseEnter(first)
    vi.advanceTimersByTime(600)
    await nextTick()

    expect(screen.getByText('First content')).toBeInTheDocument()

    await fireEvent.mouseLeave(first)
    await nextTick()
    await nextTick()

    expect(screen.queryByText('First content')).toBeNull()

    await fireEvent.mouseEnter(second)
    await nextTick()

    expect(screen.getByText('Second content')).toBeInTheDocument()
  })
})
