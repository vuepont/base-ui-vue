import type { Ref } from 'vue'
import type { FloatingEvents, FloatingNodeType } from '../types'
import { shallowRef } from 'vue'
import { createEventEmitter } from '../utils/createEventEmitter'

/**
 * Stores and manages floating elements in a tree structure.
 */
export class FloatingTreeStore {
  readonly nodesRef: Ref<FloatingNodeType[]> = shallowRef([])

  readonly events: FloatingEvents = createEventEmitter()

  addNode(node: FloatingNodeType) {
    this.nodesRef.value = [...this.nodesRef.value, node]
  }

  removeNode(node: FloatingNodeType) {
    this.nodesRef.value = this.nodesRef.value.filter(item => item !== node)
  }
}
