import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { SliderRoot, SliderValue } from '..'

function createSliderApp(template: string) {
  return defineComponent({
    components: {
      SliderRoot,
      SliderValue,
    },
    template,
  })
}

describe('<SliderValue />', () => {
  it('renders a single value', () => {
    render(createSliderApp(`
      <SliderRoot :default-value="40">
        <SliderValue data-testid="output" />
      </SliderRoot>
    `))

    expect(screen.getByTestId('output')).toHaveTextContent('40')
  })

  it('renders a range', () => {
    render(createSliderApp(`
      <SliderRoot :default-value="[40, 65]">
        <SliderValue data-testid="output" />
      </SliderRoot>
    `))

    expect(screen.getByTestId('output')).toHaveTextContent('40 – 65')
  })

  it('renders all thumb values', () => {
    render(createSliderApp(`
      <SliderRoot :default-value="[40, 60, 80, 95]">
        <SliderValue data-testid="output" />
      </SliderRoot>
    `))

    expect(screen.getByTestId('output')).toHaveTextContent('40 – 60 – 80 – 95')
  })

  it('accepts a renderless slot', () => {
    const renderSpy = vi.fn()

    render(defineComponent({
      components: {
        SliderRoot,
        SliderValue,
      },
      setup() {
        const format: Intl.NumberFormatOptions = {
          style: 'currency',
          currency: 'USD',
        }

        return {
          format,
          renderSpy,
        }
      },
      template: `
        <SliderRoot :default-value="[40, 60]" :format="format">
          <SliderValue v-slot="{ formattedValues, values }">
            {{ renderSpy(formattedValues, values) }}
          </SliderValue>
        </SliderRoot>
      `,
    }))

    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
    })

    expect(renderSpy).toHaveBeenCalled()
    expect(renderSpy.mock.lastCall?.[0]).toEqual([
      formatter.format(40),
      formatter.format(60),
    ])
    expect(renderSpy.mock.lastCall?.[1]).toEqual([40, 60])
  })
})
