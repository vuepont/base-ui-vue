import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import FieldsetLegend from '../legend/FieldsetLegend.vue'
import FieldsetRoot from './FieldsetRoot.vue'

function renderFieldset(options: { disabled?: boolean } = {}) {
  const { disabled } = options

  return render(
    defineComponent({
      components: { FieldsetRoot, FieldsetLegend },
      setup() {
        return { disabled }
      },
      template: `
        <FieldsetRoot :disabled="disabled">
          <FieldsetLegend>Legend text</FieldsetLegend>
        </FieldsetRoot>
      `,
    }),
  )
}

describe('<FieldsetRoot />', () => {
  it('renders a fieldset element', () => {
    renderFieldset()
    expect(screen.getByRole('group')).toBeTruthy()
  })

  it('renders children', () => {
    renderFieldset()
    expect(screen.getByText('Legend text')).toBeTruthy()
  })

  it('sets data-disabled when disabled', () => {
    renderFieldset({ disabled: true })
    expect(screen.getByRole('group')).toHaveAttribute('data-disabled')
  })

  it('does not set data-disabled when not disabled', () => {
    renderFieldset({ disabled: false })
    expect(screen.getByRole('group')).not.toHaveAttribute('data-disabled')
  })
})
