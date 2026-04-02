import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import {
  SliderControl,
  SliderIndicator,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from '..'

function createSliderApp(template: string) {
  return defineComponent({
    components: {
      SliderControl,
      SliderIndicator,
      SliderRoot,
      SliderThumb,
      SliderTrack,
    },
    template,
  })
}

describe('<SliderIndicator />', () => {
  it('renders a single-thumb indicator', () => {
    render(createSliderApp(`
      <SliderRoot :default-value="40">
        <SliderControl>
          <SliderTrack>
            <SliderIndicator data-testid="indicator" />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </SliderRoot>
    `))

    const indicator = screen.getByTestId('indicator')
    expect(indicator).toHaveAttribute('data-orientation', 'horizontal')
    expect(indicator).toHaveStyle({
      position: 'relative',
      width: '40%',
    })
  })

  it('renders a range indicator', () => {
    render(createSliderApp(`
      <SliderRoot :default-value="[25, 75]">
        <SliderControl>
          <SliderTrack>
            <SliderIndicator data-testid="indicator" />
            <SliderThumb :index="0" />
            <SliderThumb :index="1" />
          </SliderTrack>
        </SliderControl>
      </SliderRoot>
    `))

    const indicator = screen.getByTestId('indicator')
    expect(indicator).toHaveStyle({
      position: 'relative',
      insetInlineStart: '25%',
      width: '50%',
    })
  })
})
