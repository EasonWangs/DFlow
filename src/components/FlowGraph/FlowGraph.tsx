/**
 * 主图组件
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphConfig, SimulationNode, SimulationEdge, FlowParticle } from '../../types/graph';
import { useFlowGraph } from '../../hooks/useFlowGraph';
import { calculateNodeRadius, getNodeColor, getPointOnEdge } from '../../utils/graphUtils';
import './FlowGraph.css';

interface FlowGraphProps {
  data: GraphData;
  config?: Partial<GraphConfig>;
  onNodeClick?: (node: SimulationNode) => void;
  onEdgeClick?: (edge: SimulationEdge) => void;
}

const defaultConfig: GraphConfig = {
  width: 800,
  height: 600,
  nodeStyle: {
    minRadius: 20,
    maxRadius: 60,
    fillColor: '#4CAF50',
    strokeColor: '#2E7D32',
    strokeWidth: 2,
    opacity: 0.9,
  },
  edgeStyle: {
    strokeColor: '#999',
    strokeWidth: 2,
    opacity: 0.6,
    animated: true,
  },
  enableZoom: true,
  enableDrag: true,
  enableForceSimulation: true,
  particlesPerFlow: 3,
};

export const FlowGraph: React.FC<FlowGraphProps> = ({
  data,
  config: userConfig,
  onNodeClick,
  onEdgeClick,
}) => {
  const config = { ...defaultConfig, ...userConfig };
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [particles, setParticles] = useState<FlowParticle[]>([]);

  const {
    simulationNodes,
    simulationEdges,
    animationEngine,
    addFlowEvent,
  } = useFlowGraph({
    nodes: data.nodes,
    edges: data.edges,
    config,
    onNodeClick,
    onEdgeClick,
  });

  // 设置缩放
  useEffect(() => {
    if (!svgRef.current || !gRef.current || !config.enableZoom) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
  }, [config.enableZoom]);

  // 设置拖拽
  useEffect(() => {
    if (!svgRef.current || !config.enableDrag) return;

    const svg = d3.select(svgRef.current);

    const drag = d3.drag<SVGCircleElement, SimulationNode>()
      .on('start', (event, d) => {
        if (!event.active && animationEngine) {
          // 可以在这里调整力模拟
        }
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active && animationEngine) {
          // 可以在这里调整力模拟
        }
        d.fx = null;
        d.fy = null;
      });

    svg.selectAll<SVGCircleElement, SimulationNode>('.node')
      .call(drag);
  }, [simulationNodes, config.enableDrag, animationEngine]);

  // 监听动画引擎的粒子更新
  useEffect(() => {
    if (!animationEngine) return;

    animationEngine.on('particlesUpdate', (newParticles) => {
      setParticles(newParticles);
    });

    // 添加流动事件
    data.flowEvents.forEach((event) => {
      addFlowEvent(event);
    });
  }, [animationEngine, data.flowEvents, addFlowEvent]);

  return (
    <svg
      ref={svgRef}
      width={config.width}
      height={config.height}
      className="flow-graph"
    >
      <defs>
        {/* 箭头标记 */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#999"
          />
        </marker>

        {/* 渐变定义 */}
        <radialGradient id="nodeGradient">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.1" />
        </radialGradient>
      </defs>

      <g ref={gRef}>
        {/* 渲染边 */}
        <g className="edges">
          {simulationEdges.map((edge) => {
            const source = typeof edge.source === 'string' ? null : edge.source;
            const target = typeof edge.target === 'string' ? null : edge.target;

            if (!source || !target) return null;

            return (
              <line
                key={edge.id}
                x1={source.x || 0}
                y1={source.y || 0}
                x2={target.x || 0}
                y2={target.y || 0}
                stroke={config.edgeStyle.strokeColor}
                strokeWidth={config.edgeStyle.strokeWidth}
                opacity={config.edgeStyle.opacity}
                markerEnd="url(#arrowhead)"
                className="edge"
                onClick={() => onEdgeClick?.(edge)}
              />
            );
          })}
        </g>

        {/* 渲染流动粒子 */}
        {config.edgeStyle.animated && (
          <g className="particles">
            {particles.map((particle) => {
              const edge = simulationEdges.find((e) => e.id === particle.edgeId);
              if (!edge) return null;

              const point = getPointOnEdge(edge, particle.progress);

              return (
                <circle
                  key={particle.id}
                  cx={point.x}
                  cy={point.y}
                  r={particle.size}
                  fill={particle.color}
                  className="particle"
                />
              );
            })}
          </g>
        )}

        {/* 渲染节点 */}
        <g className="nodes">
          {simulationNodes.map((node) => {
            const radius = calculateNodeRadius(
              node.dataAmount,
              node.maxCapacity,
              config.nodeStyle.minRadius,
              config.nodeStyle.maxRadius
            );
            const color = getNodeColor(node.dataAmount, node.maxCapacity);

            return (
              <g key={node.id} className="node-group">
                <circle
                  className="node"
                  cx={node.x || 0}
                  cy={node.y || 0}
                  r={radius}
                  fill={color}
                  stroke={config.nodeStyle.strokeColor}
                  strokeWidth={config.nodeStyle.strokeWidth}
                  opacity={config.nodeStyle.opacity}
                  onClick={() => onNodeClick?.(node)}
                  style={{ cursor: 'pointer' }}
                />
                {/* 节点标签 */}
                <text
                  x={node.x || 0}
                  y={(node.y || 0) + radius + 15}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#333"
                  className="node-label"
                >
                  {node.name}
                </text>
                {/* 数据量显示 */}
                <text
                  x={node.x || 0}
                  y={(node.y || 0) + 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#fff"
                  fontWeight="bold"
                  className="node-data"
                >
                  {Math.round(node.dataAmount)}
                </text>
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
};
