import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { ToolbarRoot, ToolbarSeparator } from '../index'

describe('<ToolbarSeparator />', () => {
  it('uses the opposite orientation of the toolbar', () => {
    const TestComponent = defineComponent({
      components: { ToolbarRoot, ToolbarSeparator },
      template: `
        <ToolbarRoot orientation="horizontal">
          <ToolbarSeparator data-testid="separator" />
        </ToolbarRoot>
      `,
    })

    const wrapper = mount(TestComponent)
    const separator = wrapper.get('[data-testid="separator"]')

    expect(separator.attributes('aria-orientation')).toBe('vertical')
  })

  it('allows the orientation to be overridden explicitly', () => {
    const TestComponent = defineComponent({
      components: { ToolbarRoot, ToolbarSeparator },
      template: `
        <ToolbarRoot orientation="horizontal">
          <ToolbarSeparator orientation="horizontal" data-testid="separator" />
        </ToolbarRoot>
      `,
    })

    const wrapper = mount(TestComponent)
    const separator = wrapper.get('[data-testid="separator"]')

    expect(separator.attributes('aria-orientation')).toBe('horizontal')
  })
})
