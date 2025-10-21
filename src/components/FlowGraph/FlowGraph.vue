<template>
  <svg
    ref="svgRef"
    :width="config.width"
    :height="config.height"
    class="flow-graph"
  >
    <defs>
      <!-- 箭头标记 -->
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

      <!-- 渐变定义 -->
      <radialGradient id="nodeGradient">
        <stop
          offset="0%"
          stop-color="#fff"
          stop-opacity="0.3"
        />
        <stop
          offset="100%"
          stop-color="#000"
          stop-opacity="0.1"
        />
      </radialGradient>
    </defs>

    <g ref="gRef">
      <!-- 渲染边 -->
      <g class="edges">
        <line
          v-for="edge in simulationEdges"
          :key="edge.id"
          :x1="getEdgeSource(edge)?.x || 0"
          :y1="getEdgeSource(edge)?.y || 0"
          :x2="getEdgeTarget(edge)?.x || 0"
          :y2="getEdgeTarget(edge)?.y || 0"
          :stroke="config.edgeStyle.strokeColor"
          :stroke-width="config.edgeStyle.strokeWidth"
          :opacity="config.edgeStyle.opacity"
          marker-end="url(#arrowhead)"
          class="edge"
          @click="() => onEdgeClick?.(edge)"
        />
      </g>

      <!-- 渲染流动粒子 -->
      <g
        v-if="config.edgeStyle.animated"
        class="particles"
      >
        <circle
          v-for="particle in particles"
          :key="particle.id"
          :cx="getParticlePosition(particle).x"
          :cy="getParticlePosition(particle).y"
          :r="particle.size"
          :fill="particle.color"
          class="particle"
        />
      </g>

      <!-- 渲染节点 -->
      <g class="nodes">
        <g
          v-for="node in simulationNodes"
          :key="node.id"
          class="node-group"
        >
          <circle
            class="node"
            :cx="node.x || 0"
            :cy="node.y || 0"
            :r="getNodeRadius(node)"
            :fill="getNodeColor(node)"
            :stroke="config.nodeStyle.strokeColor"
            :stroke-width="config.nodeStyle.strokeWidth"
            :opacity="config.nodeStyle.opacity"
            style="cursor: pointer"
            @click="() => onNodeClick?.(node)"
          />
          <!-- 节点标签 -->
          <text
            :x="node.x || 0"
            :y="(node.y || 0) + getNodeRadius(node) + 15"
            text-anchor="middle"
            font-size="12"
            fill="#333"
            class="node-label"
          >
            {{ node.name }}
          </text>
          <!-- 数据量显示 -->
          <text
            :x="node.x || 0"
            :y="(node.y || 0) + 5"
            text-anchor="middle"
            font-size="10"
            fill="#fff"
            font-weight="bold"
            class="node-data"
          >
            {{ Math.round(node.dataAmount) }}
          </text>
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import * as d3 from 'd3';
import { GraphData, GraphConfig, SimulationNode, SimulationEdge, FlowParticle } from '@/types/graph';
import { useFlowGraph } from '@/hooks/useFlowGraph';
import { calculateNodeRadius, getNodeColor as getNodeColorUtil, getPointOnEdge } from '@/utils/graphUtils';
import './FlowGraph.css';

interface Props {
  data: GraphData;
  config?: Partial<GraphConfig>;
  onNodeClick?: (node: SimulationNode) => void;
  onEdgeClick?: (edge: SimulationEdge) => void;
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
  onNodeClick: undefined,
  onEdgeClick: undefined,
});

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

const config = computed(() => ({ ...defaultConfig, ...props.config }));
const svgRef = ref<SVGSVGElement | null>(null);
const gRef = ref<SVGGElement | null>(null);
const particles = ref<FlowParticle[]>([]);

const {
  simulationNodes,
  simulationEdges,
  animationEngine,
  addFlowEvent,
} = useFlowGraph({
  nodes: props.data.nodes,
  edges: props.data.edges,
  config: config.value,
  onNodeClick: props.onNodeClick,
  onEdgeClick: props.onEdgeClick,
});

// 设置缩放
onMounted(() => {
  if (!svgRef.value || !gRef.value || !config.value.enableZoom) return;

  const svg = d3.select(svgRef.value);
  const g = d3.select(gRef.value);

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);
});

// 设置拖拽
watch([simulationNodes, () => config.value.enableDrag], () => {
  if (!svgRef.value || !config.value.enableDrag) return;

  const svg = d3.select(svgRef.value);
  const engine = animationEngine();

  const drag = d3.drag<SVGCircleElement, SimulationNode>()
    .on('start', (event, d) => {
      if (!event.active && engine) {
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
      if (!event.active && engine) {
        // 可以在这里调整力模拟
      }
      d.fx = null;
      d.fy = null;
    });

  svg.selectAll<SVGCircleElement, SimulationNode>('.node')
    .call(drag);
});

// 监听动画引擎的粒子更新
watch(animationEngine, (engine) => {
  if (!engine) return;

  engine.on('particlesUpdate', (newParticles: FlowParticle[]) => {
    particles.value = newParticles;
  });
});

// 添加流动事件
watch(() => props.data.flowEvents, (flowEvents) => {
  flowEvents.forEach((event) => {
    addFlowEvent(event);
  });
}, { deep: true });

// 辅助函数
const getEdgeSource = (edge: SimulationEdge) => {
  return typeof edge.source === 'string' ? null : edge.source;
};

const getEdgeTarget = (edge: SimulationEdge) => {
  return typeof edge.target === 'string' ? null : edge.target;
};

const getNodeRadius = (node: SimulationNode) => {
  return calculateNodeRadius(
    node.dataAmount,
    node.maxCapacity,
    config.value.nodeStyle.minRadius,
    config.value.nodeStyle.maxRadius
  );
};

const getNodeColor = (node: SimulationNode) => {
  return getNodeColorUtil(node.dataAmount, node.maxCapacity);
};

const getParticlePosition = (particle: FlowParticle) => {
  const edge = simulationEdges.value.find((e) => e.id === particle.edgeId);
  if (!edge) return { x: 0, y: 0 };
  return getPointOnEdge(edge, particle.progress);
};
</script>
