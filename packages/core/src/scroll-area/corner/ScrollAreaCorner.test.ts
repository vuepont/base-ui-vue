import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import ScrollAreaRoot from '../root/ScrollAreaRoot.vue'
import ScrollAreaViewport from '../viewport/ScrollAreaViewport.vue'
import ScrollAreaCorner from './ScrollAreaCorner.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: { ScrollAreaRoot, ScrollAreaViewport, ScrollAreaCorner },
    setup: options.setup,
    template: options.template,
  })
}

describe('<ScrollAreaCorner />', () => {
  it('does not render when corner is hidden (no overflow)', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport />
            <ScrollAreaCorner data-testid="corner" />
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.queryByTestId('corner')).toBeNull()
  })
})
