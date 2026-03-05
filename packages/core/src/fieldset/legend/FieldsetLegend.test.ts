import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import FieldsetRoot from '../root/FieldsetRoot.vue'
import FieldsetLegend from './FieldsetLegend.vue'

function renderFieldsetWithLegend(options: {
  legendId?: string
  legendText?: string
  disabled?: boolean
} = {}) {
  const { legendId, legendText = 'Legend', disabled } = options

  return render(
    defineComponent({
      components: { FieldsetRoot, FieldsetLegend },
      setup() {
        return { legendId, legendText, disabled }
      },
      template: `
        <FieldsetRoot :disabled="disabled">
          <FieldsetLegend :id="legendId" data-testid="legend">{{ legendText }}</FieldsetLegend>
        </FieldsetRoot>
      `,
    }),
  )
}

describe('<FieldsetLegend />', () => {
  it('renders a div element by default', () => {
    renderFieldsetWithLegend()
    const legend = screen.getByTestId('legend')
    expect(legend.tagName).toBe('DIV')
  })

  it('renders children', () => {
    renderFieldsetWithLegend({ legendText: 'My Legend' })
    expect(screen.getByText('My Legend')).toBeTruthy()
  })

  it('should set aria-labelledby on the fieldset automatically', async () => {
    renderFieldsetWithLegend()
    await nextTick()

    const fieldset = screen.getByRole('group')
    const legend = screen.getByTestId('legend')

    expect(fieldset).toHaveAttribute('aria-labelledby', legend.id)
  })

  it('should set aria-labelledby on the fieldset with custom id', async () => {
    renderFieldsetWithLegend({ legendId: 'legend-id' })
    await nextTick()

    const fieldset = screen.getByRole('group')

    expect(fieldset).toHaveAttribute('aria-labelledby', 'legend-id')
  })

  it('sets data-disabled on legend when fieldset is disabled', () => {
    renderFieldsetWithLegend({ disabled: true })
    const legend = screen.getByTestId('legend')
    expect(legend).toHaveAttribute('data-disabled')
  })

  it('does not set data-disabled on legend when fieldset is not disabled', () => {
    renderFieldsetWithLegend({ disabled: false })
    const legend = screen.getByTestId('legend')
    expect(legend).not.toHaveAttribute('data-disabled')
  })
})
