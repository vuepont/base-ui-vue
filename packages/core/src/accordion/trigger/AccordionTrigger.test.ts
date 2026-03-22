import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { DirectionProvider } from '../../direction-provider'
import AccordionHeader from '../header/AccordionHeader.vue'
import AccordionItem from '../item/AccordionItem.vue'
import AccordionPanel from '../panel/AccordionPanel.vue'
import AccordionRoot from '../root/AccordionRoot.vue'
import AccordionTrigger from './AccordionTrigger.vue'

function renderAccordion(
  options: {
    orientation?: 'horizontal' | 'vertical'
    loopFocus?: boolean
    disabled?: boolean
  } = {},
) {
  const { orientation, loopFocus, disabled } = options

  return render(
    defineComponent({
      components: {
        AccordionRoot,
        AccordionItem,
        AccordionHeader,
        AccordionTrigger,
        AccordionPanel,
      },
      setup() {
        return { orientation, loopFocus, disabled }
      },
      template: `
        <AccordionRoot :orientation="orientation" :loop-focus="loopFocus" :disabled="disabled">
          <AccordionItem value="item-1">
            <AccordionHeader>
              <AccordionTrigger>Trigger 1</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel 1</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionHeader>
              <AccordionTrigger>Trigger 2</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel 2</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionHeader>
              <AccordionTrigger>Trigger 3</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel 3</AccordionPanel>
          </AccordionItem>
        </AccordionRoot>
      `,
    }),
  )
}

function renderReactiveDirectionAccordion(initialDirection: 'ltr' | 'rtl' = 'ltr') {
  return render(
    defineComponent({
      components: {
        AccordionRoot,
        AccordionItem,
        AccordionHeader,
        AccordionTrigger,
        AccordionPanel,
        DirectionProvider,
      },
      setup() {
        const direction = ref<'ltr' | 'rtl'>(initialDirection)

        return { direction }
      },
      template: `
        <button type="button" @click="direction = 'ltr'">Set LTR</button>
        <button type="button" @click="direction = 'rtl'">Set RTL</button>

        <DirectionProvider :direction="direction">
          <AccordionRoot orientation="horizontal">
            <AccordionItem value="item-1">
              <AccordionHeader>
                <AccordionTrigger>Trigger 1</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>Panel 1</AccordionPanel>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionHeader>
                <AccordionTrigger>Trigger 2</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>Panel 2</AccordionPanel>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionHeader>
                <AccordionTrigger>Trigger 3</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>Panel 3</AccordionPanel>
            </AccordionItem>
          </AccordionRoot>
        </DirectionProvider>
      `,
    }),
  )
}

describe('<AccordionTrigger />', () => {
  describe('click behavior', () => {
    it('opens the corresponding panel on click', async () => {
      const user = userEvent.setup()
      renderAccordion()

      const trigger = screen.getByRole('button', { name: 'Trigger 1' })
      expect(screen.queryByText('Panel 1')).toBeNull()

      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(screen.queryByText('Panel 1')).not.toBeNull()
      expect(trigger).toHaveAttribute('data-panel-open')
    })

    it('closes the panel when clicked again (single mode)', async () => {
      const user = userEvent.setup()
      renderAccordion()

      const trigger = screen.getByRole('button', { name: 'Trigger 1' })

      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).not.toHaveAttribute('data-panel-open')
    })
  })

  describe('aria attributes', () => {
    it('sets aria-expanded and aria-controls', async () => {
      const user = userEvent.setup()
      renderAccordion()

      const trigger = screen.getByRole('button', { name: 'Trigger 1' })

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).not.toHaveAttribute('aria-controls')

      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger).toHaveAttribute('aria-controls')
    })
  })

  describe('keyboard navigation (vertical)', () => {
    it('arrowDown moves focus to the next trigger', async () => {
      const user = userEvent.setup()
      renderAccordion()

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      trigger1.focus()
      await user.keyboard('[ArrowDown]')

      expect(trigger2).toHaveFocus()
    })

    it('arrowUp moves focus to the previous trigger', async () => {
      const user = userEvent.setup()
      renderAccordion()

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      trigger2.focus()
      await user.keyboard('[ArrowUp]')

      expect(trigger1).toHaveFocus()
    })

    it('home moves focus to the first trigger', async () => {
      const user = userEvent.setup()
      renderAccordion()

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger3 = screen.getByRole('button', { name: 'Trigger 3' })

      trigger3.focus()
      await user.keyboard('[Home]')

      expect(trigger1).toHaveFocus()
    })

    it('end moves focus to the last trigger', async () => {
      const user = userEvent.setup()
      renderAccordion()

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger3 = screen.getByRole('button', { name: 'Trigger 3' })

      trigger1.focus()
      await user.keyboard('[End]')

      expect(trigger3).toHaveFocus()
    })

    it('loops focus when loopFocus is true', async () => {
      const user = userEvent.setup()
      renderAccordion({ loopFocus: true })

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger3 = screen.getByRole('button', { name: 'Trigger 3' })

      trigger3.focus()
      await user.keyboard('[ArrowDown]')

      expect(trigger1).toHaveFocus()
    })

    it('does not loop focus when loopFocus is false', async () => {
      const user = userEvent.setup()
      renderAccordion({ loopFocus: false })

      const trigger3 = screen.getByRole('button', { name: 'Trigger 3' })

      trigger3.focus()
      await user.keyboard('[ArrowDown]')

      expect(trigger3).toHaveFocus()
    })
  })

  describe('keyboard navigation (horizontal)', () => {
    it('arrowRight moves focus to the next trigger', async () => {
      const user = userEvent.setup()
      renderAccordion({ orientation: 'horizontal' })

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      trigger1.focus()
      await user.keyboard('[ArrowRight]')

      expect(trigger2).toHaveFocus()
    })

    it('arrowLeft moves focus to the previous trigger', async () => {
      const user = userEvent.setup()
      renderAccordion({ orientation: 'horizontal' })

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      trigger2.focus()
      await user.keyboard('[ArrowLeft]')

      expect(trigger1).toHaveFocus()
    })

    it('updates ArrowLeft and ArrowRight behavior when direction changes from ltr to rtl', async () => {
      const user = userEvent.setup()
      renderReactiveDirectionAccordion('ltr')

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })
      const setRtl = screen.getByRole('button', { name: 'Set RTL' })

      trigger1.focus()
      await user.keyboard('[ArrowRight]')
      expect(trigger2).toHaveFocus()

      await user.click(setRtl)

      trigger2.focus()
      await user.keyboard('[ArrowRight]')
      expect(trigger1).toHaveFocus()

      trigger1.focus()
      await user.keyboard('[ArrowLeft]')
      expect(trigger2).toHaveFocus()
    })

    it('updates ArrowLeft and ArrowRight behavior when direction changes from rtl to ltr', async () => {
      const user = userEvent.setup()
      renderReactiveDirectionAccordion('rtl')

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })
      const setLtr = screen.getByRole('button', { name: 'Set LTR' })

      trigger1.focus()
      await user.keyboard('[ArrowLeft]')
      expect(trigger2).toHaveFocus()

      await user.click(setLtr)

      trigger2.focus()
      await user.keyboard('[ArrowLeft]')
      expect(trigger1).toHaveFocus()

      trigger1.focus()
      await user.keyboard('[ArrowRight]')
      expect(trigger2).toHaveFocus()
    })
  })

  it('keeps a non-native trigger tabbable', async () => {
    const App = defineComponent({
      components: {
        AccordionRoot,
        AccordionItem,
        AccordionHeader,
        AccordionTrigger,
        AccordionPanel,
      },
      template: `
        <AccordionRoot>
          <AccordionItem value="item-1">
            <AccordionHeader>
              <AccordionTrigger :native-button="false" as="span">Trigger</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel</AccordionPanel>
          </AccordionItem>
        </AccordionRoot>
      `,
    })

    render(App)

    const trigger = screen.getByRole('button', { name: 'Trigger' })
    expect(trigger).toHaveAttribute('tabindex', '0')
  })
})
