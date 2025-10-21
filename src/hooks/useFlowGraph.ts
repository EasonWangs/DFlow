/**
 * 核心图管理Hook
 */

import { useEffect, useRef, useState, useCallback } from 'react';
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
  const svgRef = useRef<SVGSVGElement>(null);
  const [simulationNodes, setSimulationNodes] = useState<SimulationNode[]>([]);
  const [simulationEdges, setSimulationEdges] = useState<SimulationEdge[]>([]);

  const animationEngineRef = useRef<FlowAnimationEngine | null>(null);
  const layoutEngineRef = useRef<LayoutEngine | null>(null);
  const simulationRef = useRef<d3.Simulation<SimulationNode, SimulationEdge> | null>(null);

  // 初始化引擎
  useEffect(() => {
    const width = config.width || 800;
    const height = config.height || 600;

    animationEngineRef.current = new FlowAnimationEngine(config.particlesPerFlow || 3);
    layoutEngineRef.current = new LayoutEngine(width, height);

    return () => {
      animationEngineRef.current?.destroy();
      layoutEngineRef.current?.stop();
    };
  }, []);

  // 更新图数据
  useEffect(() => {
    const simNodes = toSimulationNodes(nodes);
    const simEdges = toSimulationEdges(edges, simNodes);

    setSimulationNodes(simNodes);
    setSimulationEdges(simEdges);

    // 更新动画引擎的节点数据
    if (animationEngineRef.current) {
      animationEngineRef.current.setNodes(nodes);
    }

    // 创建或更新力导向布局
    if (layoutEngineRef.current && config.enableForceSimulation !== false) {
      const simulation = layoutEngineRef.current.createForceLayout(simNodes, simEdges);

      simulation.on('tick', () => {
        setSimulationNodes([...simNodes]);
      });

      simulationRef.current = simulation;
    }
  }, [nodes, edges, config.enableForceSimulation]);

  // 添加流动事件
  const addFlowEvent = useCallback((event: FlowEvent) => {
    if (animationEngineRef.current) {
      animationEngineRef.current.addFlowEvent(event);

      // 启动动画
      if (!animationEngineRef.current) return;
      animationEngineRef.current.start();
    }
  }, []);

  // 更新节点数据
  const updateNodeData = useCallback((nodeId: string, newAmount: number) => {
    if (animationEngineRef.current) {
      animationEngineRef.current.updateNodeData(nodeId, newAmount);
    }
  }, []);

  return {
    svgRef,
    simulationNodes,
    simulationEdges,
    animationEngine: animationEngineRef.current,
    layoutEngine: layoutEngineRef.current,
    simulation: simulationRef.current,
    addFlowEvent,
    updateNodeData,
  };
}
