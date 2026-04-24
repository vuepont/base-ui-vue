import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { ProgressRoot, ProgressValue } from '..'

function createProgressApp(template: string, setup?: () => Record<string, unknown>) {
  return defineComponent({
    components: {
      ProgressRoot,
      ProgressValue,
    },
    setup,
    template,
  })
}

describe('<ProgressValue />', () => {
  it('renders the default percent-formatted value', () => {
    render(createProgressApp(`
      <ProgressRoot :value="30">
        <ProgressValue data-testid="value" />
      </ProgressRoot>
    `))

    expect(screen.getByTestId('value')).toHaveTextContent(
      (0.3).toLocaleString(undefined, { style: 'percent' }),
    )
  })

  it('renders the formatted value when format is provided', () => {
    const format: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: 'USD',
    }

    render(createProgressApp(
      `
        <ProgressRoot :value="30" :format="format">
          <ProgressValue data-testid="value" />
        </ProgressRoot>
      `,
      () => ({ format }),
    ))

    const expected = new Intl.NumberFormat(undefined, format).format(30)
    expect(screen.getByTestId('value')).toHaveTextContent(expected)
  })

  it('renders empty text when indeterminate', () => {
    render(createProgressApp(`
      <ProgressRoot :value="null">
        <ProgressValue data-testid="value" />
      </ProgressRoot>
    `))

    expect(screen.getByTestId('value').textContent).toBe('')
  })

  describe('slot props', () => {
    it('exposes formatted and raw values', () => {
      const renderSpy = vi.fn()
      const format: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: 'USD',
      }
      const formatValue = (v: number) =>
        new Intl.NumberFormat(undefined, format).format(v)

      render(defineComponent({
        components: { ProgressRoot, ProgressValue },
        setup() {
          return { renderSpy, format }
        },
        template: `
          <ProgressRoot :value="30" :format="format">
            <ProgressValue v-slot="{ value, formattedValue }">
              {{ renderSpy(value, formattedValue) }}
            </ProgressValue>
          </ProgressRoot>
        `,
      }))

      expect(renderSpy).toHaveBeenCalled()
      const [value, formattedValue] = renderSpy.mock.lastCall as [number, string]
      expect(value).toBe(30)
      expect(formattedValue).toBe(formatValue(30))
    })

    it('exposes "indeterminate" when the value is null', () => {
      const renderSpy = vi.fn()

      render(defineComponent({
        components: { ProgressRoot, ProgressValue },
        setup() {
          return { renderSpy }
        },
        template: `
          <ProgressRoot :value="null">
            <ProgressValue v-slot="{ value, formattedValue }">
              {{ renderSpy(value, formattedValue) }}
            </ProgressValue>
          </ProgressRoot>
        `,
      }))

      expect(renderSpy).toHaveBeenCalled()
      const [value, formattedValue] = renderSpy.mock.lastCall as [number | null, string]
      expect(value).toBe(null)
      expect(formattedValue).toBe('indeterminate')
    })
  })

  it('marks itself aria-hidden', () => {
    render(createProgressApp(`
      <ProgressRoot :value="40">
        <ProgressValue data-testid="value" />
      </ProgressRoot>
    `))

    expect(screen.getByTestId('value')).toHaveAttribute('aria-hidden', 'true')
  })
})
