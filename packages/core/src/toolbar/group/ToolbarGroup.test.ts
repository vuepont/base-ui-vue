import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { ToolbarButton, ToolbarGroup, ToolbarInput, ToolbarLink, ToolbarRoot } from '../index'

describe('<ToolbarGroup />', () => {
  // TODO: Add shared public API contract coverage for ref exposure and
  // renderless/`as` behavior if the Vue package gains a reusable conformance
  // helper comparable to the React test harness.
  it('renders a group', () => {
    const TestComponent = defineComponent({
      components: {
        ToolbarRoot,
        ToolbarGroup,
      },
      template: `
        <ToolbarRoot>
          <ToolbarGroup data-testid="group" />
        </ToolbarRoot>
      `,
    })

    const wrapper = mount(TestComponent)

    expect(wrapper.get('[data-testid="group"]').attributes('role')).toBe('group')
  })

  it('disables grouped toolbar items except links', () => {
    const TestComponent = defineComponent({
      components: {
        ToolbarRoot,
        ToolbarGroup,
        ToolbarButton,
        ToolbarLink,
        ToolbarInput,
      },
      template: `
        <ToolbarRoot>
          <ToolbarGroup disabled>
            <ToolbarButton>One</ToolbarButton>
            <ToolbarLink href="#toolbar-link">Link</ToolbarLink>
            <ToolbarInput default-value="" />
          </ToolbarGroup>
        </ToolbarRoot>
      `,
    })

    const wrapper = mount(TestComponent)

    expect(wrapper.get('button').attributes('data-disabled')).toBe('')
    expect(wrapper.get('input').attributes('data-disabled')).toBe('')
    expect(wrapper.get('a').attributes('data-disabled')).toBeUndefined()
  })
})
