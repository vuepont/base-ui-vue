import { fireEvent, render, screen } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { DirectionProvider } from '../../direction-provider'
import CompositeItem from '../item/CompositeItem.vue'
import { CompositeRoot } from './index'

describe('composite', () => {
  describe('list', () => {
    it('controlled mode', async () => {
      const App = defineComponent({
        components: { CompositeRoot, CompositeItem },
        setup() {
          const highlightedIndex = ref(0)
          return { highlightedIndex }
        },
        template: `
          <CompositeRoot v-model:highlightedIndex="highlightedIndex">
            <CompositeItem data-testid="1">1</CompositeItem>
            <CompositeItem data-testid="2">2</CompositeItem>
            <CompositeItem data-testid="3">3</CompositeItem>
          </CompositeRoot>
        `,
      })

      render(App)

      const item1 = screen.getByTestId('1')
      const item2 = screen.getByTestId('2')
      const item3 = screen.getByTestId('3')

      item1.focus()
      await flushPromises()

      expect(item1).toHaveAttribute('tabindex', '0')

      await fireEvent.keyDown(item1, { key: 'ArrowDown' })
      await flushPromises()

      expect(item2).toHaveAttribute('tabindex', '0')
      expect(item2).toHaveFocus()

      await fireEvent.keyDown(item2, { key: 'ArrowDown' })
      await flushPromises()

      expect(item3).toHaveAttribute('tabindex', '0')
      expect(item3).toHaveFocus()

      await fireEvent.keyDown(item3, { key: 'ArrowUp' })
      await flushPromises()

      expect(item2).toHaveAttribute('tabindex', '0')
      expect(item2).toHaveFocus()

      await fireEvent.keyDown(item2, { key: 'ArrowUp' })
      await flushPromises()

      expect(item1).toHaveAttribute('tabindex', '0')
      expect(item1).toHaveFocus()
    })

    it('uncontrolled mode', async () => {
      const App = defineComponent({
        components: { CompositeRoot, CompositeItem },
        template: `
          <CompositeRoot>
            <CompositeItem data-testid="1">1</CompositeItem>
            <CompositeItem data-testid="2">2</CompositeItem>
            <CompositeItem data-testid="3">3</CompositeItem>
          </CompositeRoot>
        `,
      })

      render(App)

      const item1 = screen.getByTestId('1')
      const item2 = screen.getByTestId('2')
      const item3 = screen.getByTestId('3')

      item1.focus()
      await flushPromises()

      await fireEvent.keyDown(item1, { key: 'ArrowDown' })
      await flushPromises()

      expect(item2).toHaveAttribute('tabindex', '0')
      expect(item2).toHaveFocus()

      await fireEvent.keyDown(item2, { key: 'ArrowDown' })
      await flushPromises()

      expect(item3).toHaveAttribute('tabindex', '0')
      expect(item3).toHaveFocus()

      await fireEvent.keyDown(item3, { key: 'ArrowUp' })
      await flushPromises()

      expect(item2).toHaveAttribute('tabindex', '0')
      expect(item2).toHaveFocus()

      await fireEvent.keyDown(item2, { key: 'ArrowUp' })
      await flushPromises()

      expect(item1).toHaveAttribute('tabindex', '0')
      expect(item1).toHaveFocus()
    })

    it('updates the order of items', async () => {
      const App = defineComponent({
        components: { CompositeRoot, CompositeItem },
        props: ['items'],
        template: `
          <CompositeRoot>
            <CompositeItem v-for="item in items" :key="item" :data-testid="item">
              {{ item }}
            </CompositeItem>
          </CompositeRoot>
        `,
      })
      const { rerender } = render(App, { props: { items: ['1', '2', '3'] } })

      await rerender({ items: ['1', '3', '2'] })
      await flushPromises()

      const item1 = screen.getByTestId('1')
      const item3 = screen.getByTestId('3')

      item1.focus()
      await flushPromises()

      await fireEvent.keyDown(item1, { key: 'ArrowDown' })
      await flushPromises()

      expect(item3).toHaveFocus()
    })

    describe('home and End keys', () => {
      it('home key moves focus to the first item', async () => {
        const App = defineComponent({
          components: { CompositeRoot, CompositeItem },
          template: `
            <CompositeRoot :enableHomeAndEndKeys="true">
              <CompositeItem data-testid="1">1</CompositeItem>
              <CompositeItem data-testid="2">2</CompositeItem>
              <CompositeItem data-testid="3">3</CompositeItem>
            </CompositeRoot>
          `,
        })

        render(App)

        const item1 = screen.getByTestId('1')
        const item3 = screen.getByTestId('3')

        item3.focus()
        await flushPromises()

        await fireEvent.keyDown(item3, { key: 'Home' })
        await flushPromises()

        expect(item1).toHaveAttribute('tabindex', '0')
        expect(item1).toHaveFocus()
      })

      it('end key moves focus to the last item', async () => {
        const App = defineComponent({
          components: { CompositeRoot, CompositeItem },
          template: `
            <CompositeRoot :enableHomeAndEndKeys="true">
              <CompositeItem data-testid="1">1</CompositeItem>
              <CompositeItem data-testid="2">2</CompositeItem>
              <CompositeItem data-testid="3">3</CompositeItem>
            </CompositeRoot>
          `,
        })

        render(App)

        const item1 = screen.getByTestId('1')
        const item3 = screen.getByTestId('3')

        item1.focus()
        await flushPromises()

        await fireEvent.keyDown(item1, { key: 'End' })
        await flushPromises()

        expect(item3).toHaveAttribute('tabindex', '0')
        expect(item3).toHaveFocus()
      })
    })

    describe('rtl', () => {
      it('horizontal orientation', async () => {
        const App = defineComponent({
          components: { CompositeRoot, CompositeItem, DirectionProvider },
          template: `
            <div dir="rtl">
              <DirectionProvider direction="rtl">
                <CompositeRoot orientation="horizontal">
                  <CompositeItem data-testid="1">1</CompositeItem>
                  <CompositeItem data-testid="2">2</CompositeItem>
                  <CompositeItem data-testid="3">3</CompositeItem>
                </CompositeRoot>
              </DirectionProvider>
            </div>
          `,
        })

        render(App)

        const item1 = screen.getByTestId('1')
        const item2 = screen.getByTestId('2')
        const item3 = screen.getByTestId('3')

        item1.focus()
        await flushPromises()

        await fireEvent.keyDown(item1, { key: 'ArrowDown' })
        await flushPromises()

        await fireEvent.keyDown(item1, { key: 'ArrowLeft' })
        await flushPromises()

        expect(item2).toHaveAttribute('tabindex', '0')
        expect(item2).toHaveFocus()

        await fireEvent.keyDown(item2, { key: 'ArrowLeft' })
        await flushPromises()

        expect(item3).toHaveAttribute('tabindex', '0')
        expect(item3).toHaveFocus()

        await fireEvent.keyDown(item3, { key: 'ArrowRight' })
        await flushPromises()

        expect(item2).toHaveAttribute('tabindex', '0')
        expect(item2).toHaveFocus()

        await fireEvent.keyDown(item2, { key: 'ArrowRight' })
        await flushPromises()

        expect(item1).toHaveAttribute('tabindex', '0')
        expect(item1).toHaveFocus()

        // loop backward
        await fireEvent.keyDown(item1, { key: 'ArrowRight' })
        await flushPromises()

        expect(item3).toHaveAttribute('tabindex', '0')
        expect(item3).toHaveFocus()
      })

      it('both horizontal and vertical orientation', async () => {
        const App = defineComponent({
          components: { CompositeRoot, CompositeItem, DirectionProvider },
          template: `
            <div dir="rtl">
              <DirectionProvider direction="rtl">
                <CompositeRoot orientation="both">
                  <CompositeItem data-testid="1">1</CompositeItem>
                  <CompositeItem data-testid="2">2</CompositeItem>
                  <CompositeItem data-testid="3">3</CompositeItem>
                </CompositeRoot>
              </DirectionProvider>
            </div>
          `,
        })

        render(App)

        const item1 = screen.getByTestId('1')
        const item2 = screen.getByTestId('2')
        const item3 = screen.getByTestId('3')

        item1.focus()
        await flushPromises()

        await fireEvent.keyDown(item1, { key: 'ArrowLeft' })
        await flushPromises()

        expect(item2).toHaveAttribute('tabindex', '0')
        expect(item2).toHaveFocus()

        await fireEvent.keyDown(item2, { key: 'ArrowLeft' })
        await flushPromises()

        expect(item3).toHaveAttribute('tabindex', '0')
        expect(item3).toHaveFocus()

        await fireEvent.keyDown(item3, { key: 'ArrowRight' })
        await flushPromises()

        expect(item2).toHaveAttribute('tabindex', '0')
        expect(item2).toHaveFocus()

        await fireEvent.keyDown(item2, { key: 'ArrowRight' })
        await flushPromises()

        expect(item1).toHaveAttribute('tabindex', '0')
        expect(item1).toHaveFocus()

        await fireEvent.keyDown(item1, { key: 'ArrowDown' })
        await flushPromises()

        expect(item2).toHaveAttribute('tabindex', '0')
        expect(item2).toHaveFocus()

        await fireEvent.keyDown(item2, { key: 'ArrowDown' })
        await flushPromises()

        expect(item3).toHaveAttribute('tabindex', '0')
        expect(item3).toHaveFocus()
      })
    })
  })

  describe('grid', () => {
    it('uniform 1x1 items', async () => {
      const App = defineComponent({
        components: { CompositeRoot, CompositeItem },
        setup() {
          return { items: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] }
        },
        template: `
          <CompositeRoot :cols="3" :enableHomeAndEndKeys="true">
            <CompositeItem v-for="i in items" :key="i" :data-testid="i">
              {{ i }}
            </CompositeItem>
          </CompositeRoot>
        `,
      })

      render(App)

      const item1 = screen.getByTestId('1')
      const item4 = screen.getByTestId('4')
      const item5 = screen.getByTestId('5')
      const item8 = screen.getByTestId('8')
      const item7 = screen.getByTestId('7')
      const item9 = screen.getByTestId('9')

      item1.focus()
      await flushPromises()

      await fireEvent.keyDown(item1, { key: 'ArrowDown' })
      await flushPromises()

      expect(item4).toHaveAttribute('tabindex', '0')
      expect(item4).toHaveFocus()

      await fireEvent.keyDown(item4, { key: 'ArrowRight' })
      await flushPromises()

      expect(item5).toHaveAttribute('tabindex', '0')
      expect(item5).toHaveFocus()

      await fireEvent.keyDown(item5, { key: 'ArrowDown' })
      await flushPromises()

      expect(item8).toHaveAttribute('tabindex', '0')
      expect(item8).toHaveFocus()

      await fireEvent.keyDown(item8, { key: 'ArrowLeft' })
      await flushPromises()

      expect(item7).toHaveAttribute('tabindex', '0')
      expect(item7).toHaveFocus()

      await fireEvent.keyDown(item7, { key: 'ArrowUp' })
      await flushPromises()

      expect(item4).toHaveAttribute('tabindex', '0')
      expect(item4).toHaveFocus()

      item9.focus()
      await flushPromises()

      expect(item9).toHaveAttribute('tabindex', '0')

      await fireEvent.keyDown(item9, { key: 'Home' })
      await flushPromises()

      expect(item1).toHaveAttribute('tabindex', '0')

      await fireEvent.keyDown(item1, { key: 'End' })
      await flushPromises()

      expect(item9).toHaveAttribute('tabindex', '0')
    })

    describe('prop: disabledIndices', () => {
      it('disables navigating item when their index is included', async () => {
        const App = defineComponent({
          components: { CompositeRoot, CompositeItem },
          setup() {
            const highlightedIndex = ref(0)
            return { highlightedIndex }
          },
          template: `
            <CompositeRoot
              v-model:highlightedIndex="highlightedIndex"
              :disabledIndices="[1]"
              :cols="3"
            >
              <CompositeItem data-testid="1" />
              <CompositeItem data-testid="2" />
              <CompositeItem data-testid="3" />
              <CompositeItem data-testid="4" />
              <CompositeItem data-testid="5" />
              <CompositeItem data-testid="6" />
              <CompositeItem data-testid="7" />
              <CompositeItem data-testid="8" />
              <CompositeItem data-testid="9" />
            </CompositeRoot>
          `,
        })

        render(App)

        const item1 = screen.getByTestId('1')
        const item3 = screen.getByTestId('3')

        item1.focus()
        await flushPromises()

        await fireEvent.keyDown(item1, { key: 'ArrowRight' })
        await flushPromises()

        expect(item3).toHaveAttribute('tabindex', '0')
        expect(item3).toHaveFocus()

        await fireEvent.keyDown(item3, { key: 'ArrowLeft' })
        await flushPromises()

        expect(item1).toHaveAttribute('tabindex', '0')
        expect(item1).toHaveFocus()
      })
    })
  })

  describe('prop: disabledIndices', () => {
    it('disables navigating item when their index is included', async () => {
      const App = defineComponent({
        components: { CompositeRoot, CompositeItem },
        setup() {
          const highlightedIndex = ref(0)
          return { highlightedIndex }
        },
        template: `
          <CompositeRoot
            v-model:highlightedIndex="highlightedIndex"
            :disabledIndices="[1]"
          >
            <CompositeItem data-testid="1" />
            <CompositeItem data-testid="2" />
            <CompositeItem data-testid="3" />
          </CompositeRoot>
        `,
      })

      render(App)

      const item1 = screen.getByTestId('1')
      const item3 = screen.getByTestId('3')

      item1.focus()
      await flushPromises()

      await fireEvent.keyDown(item1, { key: 'ArrowDown' })
      await flushPromises()

      expect(item3).toHaveAttribute('tabindex', '0')
      expect(item3).toHaveFocus()

      await fireEvent.keyDown(item3, { key: 'ArrowUp' })
      await flushPromises()

      expect(item1).toHaveAttribute('tabindex', '0')
      expect(item1).toHaveFocus()
    })

    it('allows navigating items disabled in the DOM when their index is excluded', async () => {
      const App = defineComponent({
        components: { CompositeRoot, CompositeItem },
        setup() {
          const highlightedIndex = ref(0)
          return { highlightedIndex }
        },
        template: `
          <CompositeRoot
            v-model:highlightedIndex="highlightedIndex"
            :disabledIndices="[]"
          >
            <CompositeItem as="span" data-testid="1" data-disabled aria-disabled="true" disabled />
            <CompositeItem as="span" data-testid="2" data-disabled aria-disabled="true" disabled />
            <CompositeItem as="span" data-testid="3" data-disabled aria-disabled="true" disabled />
          </CompositeRoot>
        `,
      })

      render(App)

      const item1 = screen.getByTestId('1')
      const item2 = screen.getByTestId('2')
      const item3 = screen.getByTestId('3')

      item1.focus()
      await flushPromises()

      await fireEvent.keyDown(item1, { key: 'ArrowDown' })
      await flushPromises()

      expect(item2).toHaveAttribute('tabindex', '0')
      expect(item2).toHaveFocus()

      await fireEvent.keyDown(item2, { key: 'ArrowDown' })
      await flushPromises()

      expect(item3).toHaveAttribute('tabindex', '0')
      expect(item3).toHaveFocus()

      await fireEvent.keyDown(item3, { key: 'ArrowDown' })
      await flushPromises()

      expect(item1).toHaveAttribute('tabindex', '0')
      expect(item1).toHaveFocus()

      await fireEvent.keyDown(item1, { key: 'ArrowUp' })
      await flushPromises()

      expect(item3).toHaveAttribute('tabindex', '0')
      expect(item3).toHaveFocus()
    })
  })

  describe('prop: modifierKeys', () => {
    it('prevents arrow key navigation when any modifier key is pressed by default', async () => {
      const App = defineComponent({
        components: { CompositeRoot, CompositeItem },
        template: `
          <CompositeRoot>
            <CompositeItem data-testid="1">1</CompositeItem>
            <CompositeItem data-testid="2">2</CompositeItem>
          </CompositeRoot>
        `,
      })

      render(App)

      const item1 = screen.getByTestId('1')

      item1.focus()
      await flushPromises()

      expect(item1).toHaveFocus()

      await fireEvent.keyDown(item1, { key: 'ArrowDown', shiftKey: true })
      await flushPromises()
      expect(item1).toHaveFocus()

      await fireEvent.keyDown(item1, { key: 'ArrowDown', ctrlKey: true })
      await flushPromises()
      expect(item1).toHaveFocus()

      await fireEvent.keyDown(item1, { key: 'ArrowDown', altKey: true })
      await flushPromises()
      expect(item1).toHaveFocus()

      await fireEvent.keyDown(item1, { key: 'ArrowDown', metaKey: true })
      await flushPromises()
      expect(item1).toHaveFocus()
    })

    it('specifies allowed modifier keys that do not prevent arrow key navigation when pressed', async () => {
      const App = defineComponent({
        components: { CompositeRoot, CompositeItem },
        template: `
          <CompositeRoot :modifierKeys="['Alt', 'Meta']">
            <CompositeItem data-testid="1">1</CompositeItem>
            <CompositeItem data-testid="2">2</CompositeItem>
            <CompositeItem data-testid="3">3</CompositeItem>
          </CompositeRoot>
        `,
      })

      render(App)

      const item1 = screen.getByTestId('1')
      const item2 = screen.getByTestId('2')
      const item3 = screen.getByTestId('3')

      item1.focus()
      await flushPromises()

      expect(item1).toHaveFocus()

      await fireEvent.keyDown(item1, { key: 'ArrowDown', shiftKey: true })
      await flushPromises()
      expect(item1).toHaveFocus()

      await fireEvent.keyDown(item1, { key: 'ArrowDown', ctrlKey: true })
      await flushPromises()
      expect(item1).toHaveFocus()

      await fireEvent.keyDown(item1, { key: 'ArrowDown', altKey: true })
      await flushPromises()
      expect(item2).toHaveFocus()

      await fireEvent.keyDown(item2, { key: 'ArrowDown', metaKey: true })
      await flushPromises()
      expect(item3).toHaveFocus()
    })
  })
})
