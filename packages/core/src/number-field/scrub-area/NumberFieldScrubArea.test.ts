import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import FieldRoot from '../../field/root/FieldRoot.vue'
import NumberFieldInput from '../input/NumberFieldInput.vue'
import NumberFieldRoot from '../root/NumberFieldRoot.vue'
import NumberFieldScrubAreaCursor from '../scrub-area-cursor/NumberFieldScrubAreaCursor.vue'
import NumberFieldScrubArea from './NumberFieldScrubArea.vue'

function createApp(template: string) {
  return defineComponent({
    components: {
      FieldRoot,
      NumberFieldRoot,
      NumberFieldInput,
      NumberFieldScrubArea,
      NumberFieldScrubAreaCursor,
    },
    template,
  })
}

describe('<NumberFieldScrubArea />', () => {
  it('renders a presentation element', () => {
    render(
      createApp(`
        <FieldRoot>
          <NumberFieldRoot :default-value="5">
            <NumberFieldScrubArea data-testid="scrub">
              <NumberFieldScrubAreaCursor />
            </NumberFieldScrubArea>
            <NumberFieldInput />
          </NumberFieldRoot>
        </FieldRoot>
      `),
    )

    expect(screen.getByTestId('scrub')).toHaveAttribute('role', 'presentation')
  })

  it('does not render the cursor while idle', () => {
    render(
      createApp(`
        <FieldRoot>
          <NumberFieldRoot :default-value="5">
            <NumberFieldScrubArea>
              <NumberFieldScrubAreaCursor data-testid="cursor" />
            </NumberFieldScrubArea>
            <NumberFieldInput />
          </NumberFieldRoot>
        </FieldRoot>
      `),
    )

    expect(screen.queryByTestId('cursor')).not.toBeInTheDocument()
  })
})
