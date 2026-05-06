import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { MeterIndicator, MeterLabel, MeterRoot, MeterTrack, MeterValue } from '..'

function createMeterApp(template: string, setup?: () => Record<string, unknown>) {
  return defineComponent({
    components: {
      MeterIndicator,
      MeterLabel,
      MeterRoot,
      MeterTrack,
      MeterValue,
    },
    setup,
    template,
  })
}

describe('<MeterRoot />', () => {
  it('renders a div with the meter role', () => {
    render(MeterRoot, {
      props: {
        value: 50,
      },
    })

    const meter = screen.getByRole('meter')
    expect(meter.tagName).toBe('DIV')
  })

  describe('aria attributes', () => {
    it('sets the correct aria attributes', async () => {
      render(createMeterApp(`
        <MeterRoot :value="30">
          <MeterLabel>Battery Level</MeterLabel>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </MeterRoot>
      `))

      await nextTick()

      const meter = screen.getByRole('meter')

      expect(meter).toHaveAttribute('aria-valuenow', '30')
      expect(meter).toHaveAttribute('aria-valuemin', '0')
      expect(meter).toHaveAttribute('aria-valuemax', '100')
      expect(meter).toHaveAttribute('aria-valuetext', '30%')

      const label = screen.getByText('Battery Level')
      expect(meter.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))
    })

    it('updates aria-valuenow when the value changes', async () => {
      const value = ref(50)

      render(createMeterApp(
        `
        <MeterRoot :value="value">
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </MeterRoot>
      `,
        () => ({ value }),
      ))

      const meter = screen.getByRole('meter')
      expect(meter).toHaveAttribute('aria-valuenow', '50')

      value.value = 77
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(meter).toHaveAttribute('aria-valuenow', '77')
    })

    it('respects custom min and max', () => {
      render(MeterRoot, {
        props: {
          value: 10,
          min: 5,
          max: 20,
        },
      })

      const meter = screen.getByRole('meter')
      expect(meter).toHaveAttribute('aria-valuemin', '5')
      expect(meter).toHaveAttribute('aria-valuemax', '20')
      expect(meter).toHaveAttribute('aria-valuenow', '10')
    })
  })

  describe('prop: format', () => {
    it('formats the value', () => {
      const format: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: 'USD',
      }
      const formatValue = (v: number) =>
        new Intl.NumberFormat(undefined, format).format(v)

      render(createMeterApp(
        `
        <MeterRoot :value="30" :format="format">
          <MeterValue data-testid="value" />
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </MeterRoot>
      `,
        () => ({ format }),
      ))

      const value = screen.getByTestId('value')
      const meter = screen.getByRole('meter')
      expect(value).toHaveTextContent(formatValue(30))
      expect(meter).toHaveAttribute('aria-valuetext', formatValue(30))
    })
  })

  describe('prop: locale', () => {
    it('uses the provided locale when formatting the value', () => {
      const expectedValue = new Intl.NumberFormat('de-DE', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(86.49)

      render(createMeterApp(
        `
        <MeterRoot
          :value="86.49"
          :format="format"
          locale="de-DE"
        >
          <MeterValue data-testid="value" />
        </MeterRoot>
      `,
        () => ({
          format: {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          } as Intl.NumberFormatOptions,
        }),
      ))

      expect(screen.getByTestId('value')).toHaveTextContent(expectedValue)
    })
  })

  describe('prop: getAriaValueText', () => {
    it('uses the custom aria-valuetext', () => {
      render(createMeterApp(
        `
        <MeterRoot :value="50" :get-aria-value-text="getAriaValueText" />
      `,
        () => ({
          getAriaValueText: (_formatted: string, v: number) => `${v} of 100 units`,
        }),
      ))

      expect(screen.getByRole('meter')).toHaveAttribute(
        'aria-valuetext',
        '50 of 100 units',
      )
    })
  })

  describe('prop: aria-valuetext', () => {
    it('user-supplied aria-valuetext overrides the computed one', () => {
      render(createMeterApp(`
        <MeterRoot :value="50" aria-valuetext="Custom text" />
      `))

      expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', 'Custom text')
    })

    it('user-supplied aria-valuetext wins over get-aria-value-text', () => {
      render(createMeterApp(
        `
        <MeterRoot :value="50" aria-valuetext="Explicit" :get-aria-value-text="getAriaValueText" />
      `,
        () => ({
          getAriaValueText: (_formatted: string, v: number) => `${v} of 100 units`,
        }),
      ))

      expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', 'Explicit')
    })
  })

  describe('default attribute overrides', () => {
    it('user attributes can override the library defaults', () => {
      render(createMeterApp(`
        <MeterRoot
          :value="50"
          role="progressbar"
          aria-valuemin="10"
          aria-valuemax="200"
        />
      `))

      const el = screen.getByRole('progressbar')
      expect(el).toHaveAttribute('aria-valuemin', '10')
      expect(el).toHaveAttribute('aria-valuemax', '200')
      expect(el).toHaveAttribute('aria-valuenow', '50')
    })
  })

  it('supports rendering as another tag', () => {
    render(MeterRoot, {
      props: {
        value: 50,
        as: 'section',
      },
    })

    expect(screen.getByRole('meter').tagName).toBe('SECTION')
  })
})
