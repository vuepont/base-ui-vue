import { fireEvent, render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import TooltipPopup from '../popup/TooltipPopup.vue'
import TooltipPortal from '../portal/TooltipPortal.vue'
import TooltipPositioner from '../positioner/TooltipPositioner.vue'
import TooltipRoot from '../root/TooltipRoot.vue'
import { HOVERABLE_CLOSE_GRACE_DELAY } from '../utils/constants'
import TooltipTrigger from './TooltipTrigger.vue'

afterEach(() => {
  vi.useRealTimers()
})

describe('<Tooltip.Trigger />', () => {
  it('removes `data-popup-open` as soon as `open` becomes false', async () => {
    vi.useFakeTimers()

    render(defineComponent({
      components: {
        TooltipPopup,
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
        TooltipTrigger,
      },
      setup() {
        const open = ref(false)

        function handleOpenChange(nextOpen: boolean, details: any) {
          if (!nextOpen) {
            details.preventUnmountOnClose()
          }
          open.value = nextOpen
        }

        return {
          handleOpenChange,
          open,
        }
      },
      template: `
        <TooltipRoot :open="open" @open-change="handleOpenChange">
          <TooltipTrigger data-testid="trigger" :delay="0" :close-delay="0">
            Trigger
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipPositioner>
              <TooltipPopup>Content</TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    const trigger = screen.getByTestId('trigger')

    await fireEvent.mouseEnter(trigger)
    await nextTick()

    expect(trigger).toHaveAttribute('data-popup-open')

    await fireEvent.mouseLeave(trigger)
    vi.advanceTimersByTime(HOVERABLE_CLOSE_GRACE_DELAY)
    await nextTick()
    await nextTick()

    expect(trigger).not.toHaveAttribute('data-popup-open')
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('opens another trigger immediately while the tooltip is already open', async () => {
    vi.useFakeTimers()

    render(defineComponent({
      components: {
        TooltipPopup,
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
        TooltipTrigger,
      },
      template: `
        <TooltipRoot v-slot="{ payload }">
          <TooltipTrigger :payload="'first'" :delay="0">First</TooltipTrigger>
          <TooltipTrigger :payload="'second'" :delay="500">Second</TooltipTrigger>
          <TooltipPortal disabled>
            <TooltipPositioner>
              <TooltipPopup>{{ payload }}</TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    const first = screen.getByRole('button', { name: 'First' })
    const second = screen.getByRole('button', { name: 'Second' })

    await fireEvent.mouseEnter(first)
    await nextTick()

    expect(screen.getByText('first')).toBeInTheDocument()

    await fireEvent.mouseEnter(second)
    await nextTick()

    expect(screen.getByText('second')).toBeInTheDocument()

    vi.advanceTimersByTime(499)
    await nextTick()

    expect(screen.getByText('second')).toBeInTheDocument()
  })
})
