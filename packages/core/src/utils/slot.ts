import type { Component } from 'vue'

/**
 * Pass as the `as` prop to make a component renderless.
 */
export const Slot = Symbol('Slot') as unknown as Component
