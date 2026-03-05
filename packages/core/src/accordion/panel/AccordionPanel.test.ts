import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import AccordionHeader from '../header/AccordionHeader.vue'
import AccordionItem from '../item/AccordionItem.vue'
import AccordionRoot from '../root/AccordionRoot.vue'
import AccordionTrigger from '../trigger/AccordionTrigger.vue'
import AccordionPanel from './AccordionPanel.vue'

describe('<AccordionPanel />', () => {
  it('renders with aria-labelledby referencing the trigger', async () => {
    const App = defineComponent({
      components: { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel },
      template: `
        <AccordionRoot :default-value="['item-1']">
          <AccordionItem value="item-1">
            <AccordionHeader>
              <AccordionTrigger>Trigger 1</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel 1 content</AccordionPanel>
          </AccordionItem>
        </AccordionRoot>
      `,
    })

    render(App)

    const panel = screen.getByText('Panel 1 content')
    const trigger = screen.getByRole('button', { name: 'Trigger 1' })

    expect(panel).toHaveAttribute('aria-labelledby')
    expect(panel.getAttribute('aria-labelledby')).toBe(trigger.getAttribute('id'))
  })

  it('renders with role="region"', () => {
    const App = defineComponent({
      components: { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel },
      template: `
        <AccordionRoot :default-value="['item-1']">
          <AccordionItem value="item-1">
            <AccordionHeader>
              <AccordionTrigger>Trigger 1</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel 1 content</AccordionPanel>
          </AccordionItem>
        </AccordionRoot>
      `,
    })

    render(App)
    const panel = screen.getByText('Panel 1 content')
    expect(panel).toHaveAttribute('role', 'region')
  })

  it('sets CSS variables for height and width', async () => {
    const App = defineComponent({
      components: { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel },
      template: `
        <AccordionRoot :default-value="['item-1']">
          <AccordionItem value="item-1">
            <AccordionHeader>
              <AccordionTrigger>Trigger 1</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel content</AccordionPanel>
          </AccordionItem>
        </AccordionRoot>
      `,
    })

    render(App)
    const panel = screen.getByText('Panel content')
    const style = panel.getAttribute('style') || ''

    expect(style).toContain('--accordion-panel-height')
    expect(style).toContain('--accordion-panel-width')
  })

  it('keepMounted keeps the panel in the DOM', async () => {
    const App = defineComponent({
      components: { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel },
      template: `
        <AccordionRoot keep-mounted>
          <AccordionItem value="item-1">
            <AccordionHeader>
              <AccordionTrigger>Trigger 1</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel 1 content</AccordionPanel>
          </AccordionItem>
        </AccordionRoot>
      `,
    })

    render(App)

    const panel = screen.getByText('Panel 1 content')
    expect(panel).toBeDefined()
    expect(panel).toHaveAttribute('hidden')
  })

  it('supports panel-level keepMounted override', async () => {
    const App = defineComponent({
      components: { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel },
      template: `
        <AccordionRoot>
          <AccordionItem value="item-1">
            <AccordionHeader>
              <AccordionTrigger>Trigger 1</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel keep-mounted>Panel kept</AccordionPanel>
          </AccordionItem>
        </AccordionRoot>
      `,
    })

    render(App)

    const panel = screen.getByText('Panel kept')
    expect(panel).toBeDefined()
    expect(panel).toHaveAttribute('hidden')
  })
})
