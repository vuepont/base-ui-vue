import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { SliderControl, SliderLabel, SliderRoot, SliderThumb } from '..'

function createSliderApp(template: string) {
  return defineComponent({
    components: {
      SliderControl,
      SliderLabel,
      SliderRoot,
      SliderThumb,
    },
    template,
  })
}

describe('<SliderLabel />', () => {
  it('sets aria-labelledby from SliderLabel', async () => {
    render(createSliderApp(`
      <SliderRoot :default-value="50">
        <SliderLabel>Volume</SliderLabel>
        <SliderControl>
          <SliderThumb />
        </SliderControl>
      </SliderRoot>
    `))

    await nextTick()

    const label = screen.getByText('Volume')
    const slider = screen.getByRole('slider')

    expect(label.id).not.toBe('')
    expect(slider).toHaveAttribute('aria-labelledby', label.id)
  })

  it('sliderLabel focuses slider on click', async () => {
    const user = userEvent.setup()

    render(createSliderApp(`
      <SliderRoot :default-value="50">
        <SliderLabel>Volume</SliderLabel>
        <SliderControl>
          <SliderThumb />
        </SliderControl>
      </SliderRoot>
    `))

    await user.click(screen.getByText('Volume'))

    await waitFor(() => {
      expect(screen.getByRole('slider')).toHaveFocus()
    })
  })

  it('sliderLabel does not focus a thumb on click for range sliders', async () => {
    const user = userEvent.setup()

    render(createSliderApp(`
      <SliderRoot :default-value="[25, 75]">
        <SliderLabel>Volume</SliderLabel>
        <SliderControl>
          <SliderThumb :index="0" />
          <SliderThumb :index="1" />
        </SliderControl>
      </SliderRoot>
    `))

    await user.click(screen.getByText('Volume'))

    expect(screen.getAllByRole('slider').includes(document.activeElement as HTMLElement)).toBe(false)
  })
})
