/**
 * 布局引擎
 * 提供多种图布局算法
 */

import * as d3 from 'd3';
import { SimulationNode, SimulationEdge, LayoutType } from '../types/graph';

export class LayoutEngine {
  private simulation: d3.Simulation<SimulationNode, SimulationEdge> | null = null;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * 创建力导向布局
   */
  createForceLayout(
    nodes: SimulationNode[],
    edges: SimulationEdge[],
    options?: {
      chargeStrength?: number;
      linkDistance?: number;
      centerStrength?: number;
    }
  ): d3.Simulation<SimulationNode, SimulationEdge> {
    const {
      chargeStrength = -300,
      linkDistance = 100,
      centerStrength = 0.1,
    } = options || {};

    // 为没有位置的节点设置初始位置（环形分布，避免初始闪烁）
    nodes.forEach((node, i) => {
      if (node.x === undefined || node.y === undefined) {
        const angle = (i / nodes.length) * Math.PI * 2;
        const radius = Math.min(this.width, this.height) / 4;
        node.x = this.width / 2 + radius * Math.cos(angle);
        node.y = this.height / 2 + radius * Math.sin(angle);
      }
    });

    this.simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink<SimulationNode, SimulationEdge>(edges)
          .id((d) => d.id)
          .distance(linkDistance)
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2).strength(centerStrength))
      .force('collision', d3.forceCollide().radius((d: any) => this.getNodeRadius(d) + 10));

    return this.simulation;
  }

  /**
   * 创建层次布局（树形）
   */
  createHierarchicalLayout(
    nodes: SimulationNode[],
    edges: SimulationEdge[],
    rootId: string
  ): void {
    // 构建层次结构
    const stratify = d3
      .stratify<SimulationNode>()
      .id((d) => d.id)
      .parentId((d) => {
        const parentEdge = edges.find((e) => {
          const target = typeof e.target === 'string' ? e.target : e.target.id;
          return target === d.id;
        });
        if (parentEdge) {
          return typeof parentEdge.source === 'string'
            ? parentEdge.source
            : parentEdge.source.id;
        }
        return null;
      });

    try {
      const root = stratify(nodes);
      const treeLayout = d3.tree<SimulationNode>().size([this.width - 100, this.height - 100]);
      treeLayout(root as any);

      // 应用计算出的位置
      root.descendants().forEach((d) => {
        const node = nodes.find((n) => n.id === d.id);
        if (node && d.x !== undefined && d.y !== undefined) {
          node.x = d.y + 50; // 交换x和y，使树横向
          node.y = d.x + 50;
        }
      });
    } catch (error) {
      console.error('Hierarchical layout failed:', error);
      // 回退到简单网格布局
      this.createGridLayout(nodes);
    }
  }

  /**
   * 创建环形布局
   */
  createCircularLayout(nodes: SimulationNode[]): void {
    const radius = Math.min(this.width, this.height) / 2 - 100;
    const angleStep = (2 * Math.PI) / nodes.length;

    nodes.forEach((node, i) => {
      const angle = i * angleStep;
      node.x = this.width / 2 + radius * Math.cos(angle);
      node.y = this.height / 2 + radius * Math.sin(angle);
      node.fx = node.x; // 固定位置
      node.fy = node.y;
    });
  }

  /**
   * 创建网格布局
   */
  createGridLayout(nodes: SimulationNode[]): void {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const cellWidth = this.width / (cols + 1);
    const cellHeight = this.height / (Math.ceil(nodes.length / cols) + 1);

    nodes.forEach((node, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      node.x = (col + 1) * cellWidth;
      node.y = (row + 1) * cellHeight;
    });
  }

  /**
   * 停止模拟
   */
  stop(): void {
    if (this.simulation) {
      this.simulation.stop();
    }
  }

  /**
   * 重启模拟
   */
  restart(): void {
    if (this.simulation) {
      this.simulation.alpha(1).restart();
    }
  }

  /**
   * 更新画布尺寸
   */
  updateSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    if (this.simulation) {
      this.simulation.force(
        'center',
        d3.forceCenter(this.width / 2, this.height / 2)
      );
    }
  }

  /**
   * 获取节点半径
   */
  private getNodeRadius(node: SimulationNode): number {
    const minRadius = 20;
    const maxRadius = 60;
    const scale = node.dataAmount / node.maxCapacity;
    return minRadius + (maxRadius - minRadius) * scale;
  }

  /**
   * 获取当前模拟
   */
  getSimulation(): d3.Simulation<SimulationNode, SimulationEdge> | null {
    return this.simulation;
  }
}
