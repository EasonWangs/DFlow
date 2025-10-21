/**
 * 核心图管理 Composable
 */

import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as d3 from 'd3';
import { Node, Edge, FlowEvent, SimulationNode, SimulationEdge, GraphConfig } from '../types/graph';
import { FlowAnimationEngine } from '../engine/FlowAnimationEngine';
import { LayoutEngine } from '../engine/LayoutEngine';
import { toSimulationNodes, toSimulationEdges } from '../utils/graphUtils';

interface UseFlowGraphProps {
  nodes: Node[];
  edges: Edge[];
  config: Partial<GraphConfig>;
  onNodeClick?: (node: Node) => void;
  onEdgeClick?: (edge: Edge) => void;
}

export function useFlowGraph({
  nodes,
  edges,
  config,
  onNodeClick,
  onEdgeClick,
}: UseFlowGraphProps) {
  const svgRef = ref<SVGSVGElement | null>(null);
  const simulationNodes = ref<SimulationNode[]>([]);
  const simulationEdges = ref<SimulationEdge[]>([]);

  let animationEngine: FlowAnimationEngine | null = null;
  let layoutEngine: LayoutEngine | null = null;
  let simulation: d3.Simulation<SimulationNode, SimulationEdge> | null = null;

  // 初始化引擎
  onMounted(() => {
    const width = config.width || 800;
    const height = config.height || 600;

    animationEngine = new FlowAnimationEngine(config.particlesPerFlow || 3);
    layoutEngine = new LayoutEngine(width, height);
  });

  // 清理引擎
  onUnmounted(() => {
    animationEngine?.destroy();
    layoutEngine?.stop();
  });

  // 更新图数据
  watch(
    () => [nodes, edges, config.enableForceSimulation],
    () => {
      const simNodes = toSimulationNodes(nodes);
      const simEdges = toSimulationEdges(edges, simNodes);

      simulationNodes.value = simNodes;
      simulationEdges.value = simEdges;

      // 更新动画引擎的节点数据
      if (animationEngine) {
        animationEngine.setNodes(nodes);
      }

      // 创建或更新力导向布局
      if (layoutEngine && config.enableForceSimulation !== false) {
        simulation = layoutEngine.createForceLayout(simNodes, simEdges);

        simulation.on('tick', () => {
          simulationNodes.value = [...simNodes];
        });
      }
    },
    { deep: true, immediate: true }
  );

  // 添加流动事件
  const addFlowEvent = (event: FlowEvent) => {
    if (animationEngine) {
      animationEngine.addFlowEvent(event);

      // 启动动画
      if (!animationEngine) return;
      animationEngine.start();
    }
  };

  // 更新节点数据
  const updateNodeData = (nodeId: string, newAmount: number) => {
    if (animationEngine) {
      animationEngine.updateNodeData(nodeId, newAmount);
    }
  };

  return {
    svgRef,
    simulationNodes,
    simulationEdges,
    animationEngine: () => animationEngine,
    layoutEngine: () => layoutEngine,
    simulation: () => simulation,
    addFlowEvent,
    updateNodeData,
  };
}
