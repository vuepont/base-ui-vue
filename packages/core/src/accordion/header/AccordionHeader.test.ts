import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import AccordionItem from '../item/AccordionItem.vue'
import AccordionPanel from '../panel/AccordionPanel.vue'
import AccordionRoot from '../root/AccordionRoot.vue'
import AccordionTrigger from '../trigger/AccordionTrigger.vue'
import AccordionHeader from './AccordionHeader.vue'

describe('<AccordionHeader />', () => {
  it('renders as h3 by default', () => {
    const App = defineComponent({
      components: { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel },
      template: `
        <AccordionRoot>
          <AccordionItem value="item-1">
            <AccordionHeader>
              Section header
              <AccordionTrigger>Trigger 1</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Panel 1</AccordionPanel>
          </AccordionItem>
        </AccordionRoot>
      `,
    })

    render(App)
    const header = screen.getByText('Section header')

    expect(header.tagName).toBe('H3')
  })
})
