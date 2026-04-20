import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { MeterLabel, MeterRoot } from '..'

function createMeterApp(template: string) {
  return defineComponent({
    components: {
      MeterLabel,
      MeterRoot,
    },
    template,
  })
}

describe('<MeterLabel />', () => {
  it('links aria-labelledby from the meter root to the label', async () => {
    render(createMeterApp(`
      <MeterRoot :value="30">
        <MeterLabel>Battery Level</MeterLabel>
      </MeterRoot>
    `))

    await nextTick()

    const meter = screen.getByRole('meter')
    const label = screen.getByText('Battery Level')

    expect(label.id).not.toBe('')
    expect(meter.getAttribute('aria-labelledby')).toBe(label.id)
  })

  it('respects an explicit id override', async () => {
    render(createMeterApp(`
      <MeterRoot :value="30">
        <MeterLabel id="custom-meter-label">Battery Level</MeterLabel>
      </MeterRoot>
    `))

    await nextTick()

    const meter = screen.getByRole('meter')
    const label = screen.getByText('Battery Level')

    expect(label.id).toBe('custom-meter-label')
    expect(meter.getAttribute('aria-labelledby')).toBe('custom-meter-label')
  })

  it('renders a span by default', () => {
    render(createMeterApp(`
      <MeterRoot :value="30">
        <MeterLabel>Battery Level</MeterLabel>
      </MeterRoot>
    `))

    expect(screen.getByText('Battery Level').tagName).toBe('SPAN')
  })
})
