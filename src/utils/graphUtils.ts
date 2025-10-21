/**
 * 图计算工具函数
 */

import { Node, Edge, SimulationNode, SimulationEdge } from '../types/graph';

/**
 * 计算节点半径
 */
export function calculateNodeRadius(
  dataAmount: number,
  maxCapacity: number,
  minRadius: number = 20,
  maxRadius: number = 60
): number {
  const ratio = Math.min(dataAmount / maxCapacity, 1);
  return minRadius + (maxRadius - minRadius) * ratio;
}

/**
 * 将节点转换为模拟节点
 */
export function toSimulationNodes(nodes: Node[]): SimulationNode[] {
  return nodes.map((node) => ({
    ...node,
    x: node.position?.x,
    y: node.position?.y,
  }));
}

/**
 * 将边转换为模拟边
 */
export function toSimulationEdges(
  edges: Edge[],
  nodes: SimulationNode[]
): SimulationEdge[] {
  return edges.map((edge) => {
    const source = nodes.find((n) => n.id === edge.source);
    const target = nodes.find((n) => n.id === edge.target);

    if (!source || !target) {
      console.warn(`Edge ${edge.id} references non-existent nodes`);
    }

    return {
      ...edge,
      source: source || edge.source,
      target: target || edge.target,
    };
  });
}

/**
 * 计算两点之间的距离
 */
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * 计算边的中点
 */
export function getEdgeMidpoint(edge: SimulationEdge): { x: number; y: number } {
  const source =
    typeof edge.source === 'string' ? { x: 0, y: 0 } : edge.source;
  const target =
    typeof edge.target === 'string' ? { x: 0, y: 0 } : edge.target;

  return {
    x: ((source.x || 0) + (target.x || 0)) / 2,
    y: ((source.y || 0) + (target.y || 0)) / 2,
  };
}

/**
 * 沿边计算位置（progress: 0-1）
 */
export function getPointOnEdge(
  edge: SimulationEdge,
  progress: number
): { x: number; y: number } {
  const source =
    typeof edge.source === 'string' ? { x: 0, y: 0 } : edge.source;
  const target =
    typeof edge.target === 'string' ? { x: 0, y: 0 } : edge.target;

  return {
    x: (source.x || 0) + ((target.x || 0) - (source.x || 0)) * progress,
    y: (source.y || 0) + ((target.y || 0) - (source.y || 0)) * progress,
  };
}

/**
 * 获取节点颜色（基于容量利用率）
 */
export function getNodeColor(dataAmount: number, maxCapacity: number): string {
  const ratio = dataAmount / maxCapacity;

  if (ratio > 0.9) return '#ff4444'; // 接近满载 - 红色
  if (ratio > 0.7) return '#ff9944'; // 较高 - 橙色
  if (ratio > 0.4) return '#44aaff'; // 中等 - 蓝色
  return '#44ff88'; // 较低 - 绿色
}

/**
 * 获取边颜色（基于流量）
 */
export function getEdgeColor(flow: number, capacity?: number): string {
  if (!capacity) return '#999999';

  const ratio = flow / capacity;
  if (ratio > 0.8) return '#ff4444';
  if (ratio > 0.5) return '#ff9944';
  return '#999999';
}

/**
 * 生成唯一ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 验证图数据
 */
export function validateGraphData(
  nodes: Node[],
  edges: Edge[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 检查节点ID唯一性
  const nodeIds = new Set<string>();
  nodes.forEach((node) => {
    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node ID: ${node.id}`);
    }
    nodeIds.add(node.id);
  });

  // 检查边引用的节点是否存在
  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id} references non-existent source: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id} references non-existent target: ${edge.target}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 检测图中的环
 */
export function detectCycles(nodes: Node[], edges: Edge[]): string[][] {
  const graph = new Map<string, string[]>();
  nodes.forEach((node) => graph.set(node.id, []));
  edges.forEach((edge) => {
    const neighbors = graph.get(edge.source) || [];
    neighbors.push(edge.target);
    graph.set(edge.source, neighbors);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[][] = [];

  function dfs(nodeId: string, path: string[]): void {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path]);
      } else if (recursionStack.has(neighbor)) {
        // 发现环
        const cycleStart = path.indexOf(neighbor);
        cycles.push(path.slice(cycleStart));
      }
    }

    recursionStack.delete(nodeId);
  }

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      dfs(node.id, []);
    }
  });

  return cycles;
}
