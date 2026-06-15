import type { FloatingNodeType } from '../types'

export function getNodeChildren(
  nodes: FloatingNodeType[],
  id: string | undefined,
  onlyOpenChildren = true,
): FloatingNodeType[] {
  const directChildren = nodes.filter(node => node.parentId === id)

  return directChildren.flatMap(child => [
    ...(!onlyOpenChildren || child.context?.open.value ? [child] : []),
    ...getNodeChildren(nodes, child.id, onlyOpenChildren),
  ])
}
