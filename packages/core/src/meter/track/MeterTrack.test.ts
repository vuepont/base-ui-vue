import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { MeterIndicator, MeterRoot, MeterTrack } from '..'

function createMeterApp(template: string) {
  return defineComponent({
    components: {
      MeterIndicator,
      MeterRoot,
      MeterTrack,
    },
    template,
  })
}

describe('<MeterTrack />', () => {
  it('renders a div by default', () => {
    render(createMeterApp(`
      <MeterRoot :value="30">
        <MeterTrack data-testid="track" />
      </MeterRoot>
    `))

    expect(screen.getByTestId('track').tagName).toBe('DIV')
  })

  it('throws when MeterIndicator is rendered without a MeterRoot ancestor', () => {
    // MeterTrack itself has no context requirement, so this scenario actually
    // verifies that MeterIndicator fails fast when placed outside MeterRoot.
    expect(() =>
      render(createMeterApp(`
        <MeterIndicator />
      `)),
    ).toThrow()
  })

  it('renders without a MeterRoot ancestor when no Indicator is nested', () => {
    expect(() =>
      render(createMeterApp(`
        <MeterTrack data-testid="track" />
      `)),
    ).not.toThrow()

    expect(screen.getByTestId('track').tagName).toBe('DIV')
  })
})
