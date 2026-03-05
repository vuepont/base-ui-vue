import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import AccordionHeader from '../header/AccordionHeader.vue'
import AccordionPanel from '../panel/AccordionPanel.vue'
import AccordionRoot from '../root/AccordionRoot.vue'
import AccordionTrigger from '../trigger/AccordionTrigger.vue'
import AccordionItem from './AccordionItem.vue'

describe('<AccordionItem />', () => {
  it('generates a unique value when not provided', async () => {
    const user = userEvent.setup()

    const App = defineComponent({
      components: { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel },
      template: `
        <AccordionRoot>
          <AccordionItem>
            <AccordionHeader>
              <AccordionTrigger>Trigger</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Content</AccordionPanel>
          </AccordionItem>
        </AccordionRoot>
      `,
    })

    render(App)
    const trigger = screen.getByRole('button', { name: 'Trigger' })

    await user.click(trigger)
    expect(screen.queryByText('Content')).not.toBeNull()

    await user.click(trigger)
    expect(screen.queryByText('Content')).toBeNull()
  })

  it('renders data-index attribute', async () => {
    const App = defineComponent({
      components: { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel },
      template: `
        <AccordionRoot :default-value="['b']">
          <AccordionItem value="a">
            <AccordionHeader>
              <AccordionTrigger>Trigger A</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel A</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionHeader>
              <AccordionTrigger>Trigger B</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel B</AccordionPanel>
          </AccordionItem>
        </AccordionRoot>
      `,
    })

    render(App)
    await nextTick()

    const panelB = screen.getByText('Panel B')
    expect(panelB).toHaveAttribute('data-index', '1')
  })

  it('inherits disabled from root', () => {
    const App = defineComponent({
      components: { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel },
      template: `
        <AccordionRoot disabled>
          <AccordionItem value="a">
            <AccordionHeader>
              <AccordionTrigger>Trigger A</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel A</AccordionPanel>
          </AccordionItem>
        </AccordionRoot>
      `,
    })

    render(App)
    const trigger = screen.getByRole('button', { name: 'Trigger A' })
    expect(trigger).toHaveAttribute('aria-disabled', 'true')
  })

  it('emits open-change event on item', async () => {
    const user = userEvent.setup()
    const handleOpenChange = vi.fn()

    const App = defineComponent({
      components: { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel },
      setup() {
        return { handleOpenChange }
      },
      template: `
        <AccordionRoot>
          <AccordionItem value="item-1" @open-change="handleOpenChange">
            <AccordionHeader>
              <AccordionTrigger>Trigger 1</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel 1</AccordionPanel>
          </AccordionItem>
        </AccordionRoot>
      `,
    })

    render(App)
    await user.click(screen.getByRole('button', { name: 'Trigger 1' }))

    expect(handleOpenChange).toHaveBeenCalledTimes(1)
    const [openArg, details] = handleOpenChange.mock.calls[0]
    expect(openArg).toBe(true)
    expect(details).toBeDefined()
    expect(details.reason).toBe('trigger-press')
  })
})
