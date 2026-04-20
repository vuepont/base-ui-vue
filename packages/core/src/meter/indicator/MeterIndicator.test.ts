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

describe('<MeterIndicator />', () => {
  it('sets inline-start and width styles from the root value', () => {
    render(createMeterApp(`
      <MeterRoot :value="33">
        <MeterTrack>
          <MeterIndicator data-testid="indicator" />
        </MeterTrack>
      </MeterRoot>
    `))

    const indicator = screen.getByTestId('indicator') as HTMLElement
    // JSDOM returns the raw numeric 0 as the string "0" without units.
    expect(indicator.style.insetInlineStart).toBe('0')
    expect(indicator.style.width).toBe('33%')
  })

  it('sets zero width when value is 0', () => {
    render(createMeterApp(`
      <MeterRoot :value="0">
        <MeterTrack>
          <MeterIndicator data-testid="indicator" />
        </MeterTrack>
      </MeterRoot>
    `))

    const indicator = screen.getByTestId('indicator') as HTMLElement
    expect(indicator.style.width).toBe('0%')
  })

  it('respects custom min/max', () => {
    render(createMeterApp(`
      <MeterRoot :value="15" :min="10" :max="20">
        <MeterTrack>
          <MeterIndicator data-testid="indicator" />
        </MeterTrack>
      </MeterRoot>
    `))

    const indicator = screen.getByTestId('indicator') as HTMLElement
    expect(indicator.style.width).toBe('50%')
  })
})
