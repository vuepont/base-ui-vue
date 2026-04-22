import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { ProgressIndicator, ProgressLabel, ProgressRoot, ProgressTrack, ProgressValue } from '..'

function createProgressApp(template: string, setup?: () => Record<string, unknown>) {
  return defineComponent({
    components: {
      ProgressIndicator,
      ProgressLabel,
      ProgressRoot,
      ProgressTrack,
      ProgressValue,
    },
    setup,
    template,
  })
}

describe('<ProgressRoot />', () => {
  it('renders a div with the progressbar role', () => {
    render(ProgressRoot, { props: { value: 50 } })

    const progress = screen.getByRole('progressbar')
    expect(progress.tagName).toBe('DIV')
  })

  describe('aria attributes', () => {
    it('sets the correct aria attributes', async () => {
      render(createProgressApp(`
        <ProgressRoot :value="30">
          <ProgressLabel>Downloading</ProgressLabel>
          <ProgressValue />
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </ProgressRoot>
      `))

      await nextTick()

      const progress = screen.getByRole('progressbar')
      const label = screen.getByText('Downloading')

      expect(progress).toHaveAttribute('aria-valuenow', '30')
      expect(progress).toHaveAttribute('aria-valuemin', '0')
      expect(progress).toHaveAttribute('aria-valuemax', '100')
      expect(progress).toHaveAttribute(
        'aria-valuetext',
        (0.3).toLocaleString(undefined, { style: 'percent' }),
      )
      expect(progress.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))
    })

    it('updates aria-valuenow when the value changes', async () => {
      const value = ref<number | null>(50)

      render(createProgressApp(
        `
        <ProgressRoot :value="value">
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </ProgressRoot>
      `,
        () => ({ value }),
      ))

      const progress = screen.getByRole('progressbar')
      expect(progress).toHaveAttribute('aria-valuenow', '50')

      value.value = 77
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(progress).toHaveAttribute('aria-valuenow', '77')
    })

    it('omits aria-valuenow when indeterminate', () => {
      render(createProgressApp(`
        <ProgressRoot :value="null" />
      `))

      expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow')
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

      render(createProgressApp(
        `
        <ProgressRoot :value="30" :format="format">
          <ProgressValue data-testid="value" />
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </ProgressRoot>
      `,
        () => ({ format }),
      ))

      const value = screen.getByTestId('value')
      const progress = screen.getByRole('progressbar')
      expect(value).toHaveTextContent(formatValue(30))
      expect(progress).toHaveAttribute('aria-valuetext', formatValue(30))
    })
  })

  describe('prop: locale', () => {
    it('uses the provided locale when formatting the value', () => {
      const expectedValue = new Intl.NumberFormat('de-DE', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(70.51)

      render(createProgressApp(
        `
        <ProgressRoot
          :value="70.51"
          :format="format"
          locale="de-DE"
        >
          <ProgressValue data-testid="value" />
        </ProgressRoot>
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
    it('uses the custom aria-valuetext for determinate values', () => {
      render(createProgressApp(
        `
        <ProgressRoot :value="50" :get-aria-value-text="getAriaValueText" />
      `,
        () => ({
          getAriaValueText: (_formatted: string | null, v: number | null) =>
            `${v} of 100 units`,
        }),
      ))

      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuetext',
        '50 of 100 units',
      )
    })

    it('passes null formattedValue when indeterminate', () => {
      render(createProgressApp(
        `
        <ProgressRoot :value="null" :get-aria-value-text="getAriaValueText" />
      `,
        () => ({
          getAriaValueText: (formatted: string | null, v: number | null) =>
            `${formatted ?? 'none'}|${v ?? 'null'}`,
        }),
      ))

      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuetext',
        'none|null',
      )
    })
  })

  describe('prop: aria-valuetext', () => {
    it('user-supplied aria-valuetext overrides the computed one', () => {
      render(createProgressApp(`
        <ProgressRoot :value="50" aria-valuetext="Custom text" />
      `))

      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Custom text')
    })

    it('user-supplied aria-valuetext wins over get-aria-value-text', () => {
      render(createProgressApp(
        `
        <ProgressRoot :value="50" aria-valuetext="Explicit" :get-aria-value-text="getAriaValueText" />
      `,
        () => ({
          getAriaValueText: (_formatted: string | null, v: number | null) =>
            `${v} of 100 units`,
        }),
      ))

      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Explicit')
    })
  })

  describe('data-* status attributes', () => {
    it('applies data-progressing when value is between min and max', () => {
      render(createProgressApp(`
        <ProgressRoot :value="40" />
      `))

      const progress = screen.getByRole('progressbar')
      expect(progress).toHaveAttribute('data-progressing')
      expect(progress).not.toHaveAttribute('data-complete')
      expect(progress).not.toHaveAttribute('data-indeterminate')
    })

    it('applies data-complete when value equals max', () => {
      render(createProgressApp(`
        <ProgressRoot :value="100" />
      `))

      const progress = screen.getByRole('progressbar')
      expect(progress).toHaveAttribute('data-complete')
      expect(progress).not.toHaveAttribute('data-progressing')
      expect(progress).not.toHaveAttribute('data-indeterminate')
    })

    it('applies data-indeterminate when value is null', () => {
      render(createProgressApp(`
        <ProgressRoot :value="null" />
      `))

      const progress = screen.getByRole('progressbar')
      expect(progress).toHaveAttribute('data-indeterminate')
      expect(progress).not.toHaveAttribute('data-progressing')
      expect(progress).not.toHaveAttribute('data-complete')
    })
  })

  describe('default attribute overrides', () => {
    it('user attributes can override the library defaults', () => {
      render(createProgressApp(`
        <ProgressRoot
          :value="50"
          role="meter"
          aria-valuemin="10"
          aria-valuemax="200"
        />
      `))

      const el = screen.getByRole('meter')
      expect(el).toHaveAttribute('aria-valuemin', '10')
      expect(el).toHaveAttribute('aria-valuemax', '200')
      expect(el).toHaveAttribute('aria-valuenow', '50')
    })
  })

  it('supports rendering as another tag', () => {
    render(ProgressRoot, {
      props: {
        value: 50,
        as: 'section',
      },
    })

    expect(screen.getByRole('progressbar').tagName).toBe('SECTION')
  })
})
