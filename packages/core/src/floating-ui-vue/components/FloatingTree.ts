import type { InjectionKey } from 'vue'
import type { FloatingNodeType, FloatingTreeType } from '../types'
import { inject, onScopeDispose, provide } from 'vue'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { FloatingTreeStore } from './FloatingTreeStore'

const floatingNodeContextKey: InjectionKey<FloatingNodeType | null>
  = Symbol('FloatingNodeContext')
const floatingTreeContextKey: InjectionKey<FloatingTreeType | null>
  = Symbol('FloatingTreeContext')

/**
 * Returns the parent node id for nested floating elements, if available.
 */
export function useFloatingParentNodeId() {
  return inject(floatingNodeContextKey, null)?.id ?? null
}

/**
 * Returns the nearest floating tree context, if available.
 */
export function useFloatingTree(externalTree?: FloatingTreeStore) {
  const contextTree = inject(floatingTreeContextKey, null)
  return externalTree ?? contextTree
}

/**
 * Registers a node into the nearest floating tree, returning its id.
 */
export function useFloatingNodeId(externalTree?: FloatingTreeStore) {
  const id = useBaseUiId()
  const tree = useFloatingTree(externalTree)
  const parentId = useFloatingParentNodeId()

  if (id) {
    const node = { id, parentId }
    tree?.addNode(node)
    onScopeDispose(() => {
      tree?.removeNode(node)
    })
  }

  return id
}

/**
 * Provides the current floating node id and parent id to nested floating elements.
 */
export function provideFloatingNode(id: string | undefined) {
  const parentId = useFloatingParentNodeId()
  provide(floatingNodeContextKey, {
    id,
    parentId,
  })
}

/**
 * Provides a floating tree store to descendants, creating one when needed.
 */
export function provideFloatingTree(externalTree?: FloatingTreeStore) {
  const tree = externalTree ?? new FloatingTreeStore()
  provide(floatingTreeContextKey, tree)
  return tree
}
