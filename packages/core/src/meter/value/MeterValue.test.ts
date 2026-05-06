import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { MeterRoot, MeterValue } from '..'

function createMeterApp(template: string, setup?: () => Record<string, unknown>) {
  return defineComponent({
    components: {
      MeterRoot,
      MeterValue,
    },
    setup,
    template,
  })
}

describe('<MeterValue />', () => {
  it('renders the default percent-formatted value', () => {
    render(createMeterApp(`
      <MeterRoot :value="40">
        <MeterValue data-testid="value" />
      </MeterRoot>
    `))

    expect(screen.getByTestId('value')).toHaveTextContent('40%')
  })

  it('renders the formatted value when format is provided', () => {
    const format: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: 'USD',
    }

    render(createMeterApp(
      `
        <MeterRoot :value="30" :format="format">
          <MeterValue data-testid="value" />
        </MeterRoot>
      `,
      () => ({ format }),
    ))

    const expected = new Intl.NumberFormat(undefined, format).format(30)
    expect(screen.getByTestId('value')).toHaveTextContent(expected)
  })

  it('exposes value and formattedValue to a renderless slot', () => {
    const renderSpy = vi.fn()

    render(defineComponent({
      components: {
        MeterRoot,
        MeterValue,
      },
      setup() {
        return { renderSpy }
      },
      template: `
        <MeterRoot :value="40">
          <MeterValue v-slot="{ value, formattedValue }">
            {{ renderSpy(value, formattedValue) }}
          </MeterValue>
        </MeterRoot>
      `,
    }))

    expect(renderSpy).toHaveBeenCalled()
    const [value, formattedValue] = renderSpy.mock.lastCall as [number, string]
    expect(value).toBe(40)
    expect(formattedValue).toBe('40%')
  })

  it('marks itself aria-hidden', () => {
    render(createMeterApp(`
      <MeterRoot :value="40">
        <MeterValue data-testid="value" />
      </MeterRoot>
    `))

    expect(screen.getByTestId('value')).toHaveAttribute('aria-hidden', 'true')
  })
})
