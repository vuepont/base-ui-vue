import type { Orientation } from '../../utils/types'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { DirectionProvider } from '../../direction-provider'
import {
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarRoot,
} from '../index'

describe('<ToolbarRoot />', () => {
  // TODO: Add shared public API contract coverage for ref exposure and
  // renderless/`as` behavior if the Vue package gains a reusable conformance
  // helper comparable to the React test harness.
  // TODO: Add the full direction matrix from the React suite
  // (LTR/RTL x horizontal/vertical) once the Vue tests run in a browser
  // environment that reliably matches the real focus-navigation behavior.
  it('has role="toolbar"', () => {
    render(ToolbarRoot)

    expect(screen.getByRole('toolbar')).toBeInTheDocument()
  })

  it('supports keyboard navigation in horizontal LTR toolbars', async () => {
    const user = userEvent.setup()
    const orientation: Orientation = 'horizontal'

    const TestComponent = defineComponent({
      components: {
        DirectionProvider,
        ToolbarRoot,
        ToolbarButton,
        ToolbarLink,
        ToolbarGroup,
        ToolbarInput,
      },
      template: `
        <DirectionProvider direction="ltr">
          <ToolbarRoot :orientation="orientation">
            <ToolbarButton>One</ToolbarButton>
            <ToolbarLink href="#toolbar-link">Link</ToolbarLink>
            <ToolbarGroup>
              <ToolbarButton>Two</ToolbarButton>
              <ToolbarButton>Three</ToolbarButton>
            </ToolbarGroup>
            <ToolbarInput default-value="" />
          </ToolbarRoot>
        </DirectionProvider>
        `,
      setup() {
        return {
          orientation,
        }
      },
    })

    const wrapper = mount(TestComponent, { attachTo: document.body })

    const [button1, button2, button3] = wrapper.findAll('button').map(node => node.element as HTMLButtonElement)
    const link = wrapper.get('a').element as HTMLAnchorElement
    const input = wrapper.get('input').element as HTMLInputElement

    await user.tab()
    expect(document.activeElement).toBe(button1)

    await user.keyboard('[ArrowRight]')
    expect(document.activeElement).toBe(link)

    await user.keyboard('[ArrowRight]')
    expect(document.activeElement).toBe(button2)

    await user.keyboard('[ArrowRight]')
    expect(document.activeElement).toBe(button3)

    await user.keyboard('[ArrowRight]')
    expect(document.activeElement).toBe(input)

    await user.keyboard('[ArrowRight]')
    expect(document.activeElement).toBe(button1)

    wrapper.unmount()
  })

  it('disables toolbar items except links when root is disabled', () => {
    const TestComponent = defineComponent({
      components: {
        ToolbarRoot,
        ToolbarButton,
        ToolbarLink,
        ToolbarInput,
        ToolbarGroup,
      },
      template: `
        <ToolbarRoot disabled>
          <ToolbarButton>One</ToolbarButton>
          <ToolbarLink href="#toolbar-link">Link</ToolbarLink>
          <ToolbarInput default-value="" />
          <ToolbarGroup>
            <ToolbarButton>Two</ToolbarButton>
            <ToolbarInput default-value="" />
          </ToolbarGroup>
        </ToolbarRoot>
      `,
    })

    const wrapper = mount(TestComponent)

    wrapper.findAll('button').forEach((node) => {
      expect(node.attributes('aria-disabled')).toBe('true')
      expect(node.attributes('data-disabled')).toBe('')
    })

    wrapper.findAll('input').forEach((node) => {
      expect(node.attributes('aria-disabled')).toBe('true')
      expect(node.attributes('data-disabled')).toBe('')
    })

    expect(wrapper.get('[role="group"]').attributes('data-disabled')).toBe('')
    expect(wrapper.get('a').attributes('data-disabled')).toBeUndefined()
  })

  it('skips disabled items that are not focusable when disabled', async () => {
    const user = userEvent.setup()

    const TestComponent = defineComponent({
      components: {
        ToolbarRoot,
        ToolbarButton,
        ToolbarInput,
      },
      template: `
        <ToolbarRoot>
          <ToolbarButton disabled>One</ToolbarButton>
          <ToolbarButton disabled :focusable-when-disabled="false">Two</ToolbarButton>
          <ToolbarInput default-value="" disabled />
        </ToolbarRoot>
      `,
    })

    const wrapper = mount(TestComponent, { attachTo: document.body })

    const [button1, button2] = wrapper.findAll('button').map(node => node.element as HTMLButtonElement)
    const input = wrapper.get('input').element as HTMLInputElement

    expect(button1.hasAttribute('disabled')).toBe(false)
    expect(button2.hasAttribute('disabled')).toBe(true)

    await user.tab()
    expect(document.activeElement).toBe(button1)

    await user.keyboard('[ArrowRight]')
    expect(document.activeElement).toBe(input)

    await user.keyboard('[ArrowLeft]')
    expect(document.activeElement).toBe(button1)

    wrapper.unmount()
  })
})
