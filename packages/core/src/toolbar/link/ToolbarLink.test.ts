import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { ToolbarLink, ToolbarRoot } from '../index'

describe('<ToolbarLink />', () => {
  // TODO: Add shared public API contract coverage for ref exposure and
  // renderless/`as` behavior if the Vue package gains a reusable conformance
  // helper comparable to the React test harness.
  it('renders an anchor', () => {
    const TestComponent = defineComponent({
      components: { ToolbarRoot, ToolbarLink },
      template: `
        <ToolbarRoot>
          <ToolbarLink href="#toolbar-link" data-testid="link">Link</ToolbarLink>
        </ToolbarRoot>
      `,
    })

    render(TestComponent)

    expect(screen.getByTestId('link')).toBe(screen.getByRole('link'))
    expect(screen.getByRole('link')).toHaveAttribute('href', '#toolbar-link')
  })
})
