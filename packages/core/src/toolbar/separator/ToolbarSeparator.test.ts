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

  it('uses a horizontal separator in a vertical toolbar by default', () => {
    const TestComponent = defineComponent({
      components: { ToolbarRoot, ToolbarSeparator },
      template: `
        <ToolbarRoot orientation="vertical">
          <ToolbarSeparator data-testid="separator" />
        </ToolbarRoot>
      `,
    })

    const wrapper = mount(TestComponent)
    const separator = wrapper.get('[data-testid="separator"]')

    expect(separator.attributes('aria-orientation')).toBe('horizontal')
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

  it('forwards Separator slot state to ToolbarSeparator consumers', () => {
    const TestComponent = defineComponent({
      components: { ToolbarRoot, ToolbarSeparator },
      template: `
        <ToolbarRoot orientation="horizontal">
          <ToolbarSeparator v-slot="{ state }">
            <span data-testid="slot-state">{{ state.orientation }}</span>
          </ToolbarSeparator>
        </ToolbarRoot>
      `,
    })

    const wrapper = mount(TestComponent)

    expect(wrapper.get('[data-testid="slot-state"]').text()).toBe('vertical')
  })
})
