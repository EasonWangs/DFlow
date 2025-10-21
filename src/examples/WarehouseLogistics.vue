<template>
  <div style="padding: 20px; font-family: Arial, sans-serif">
    <h1 style="text-align: center; color: #333">
      仓库物流可视化系统
    </h1>

    <div style="display: flex; gap: 20px; margin-bottom: 20px">
      <!-- 控制面板 -->
      <div
        style="
          flex: 0 0 300px;
          padding: 20px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        "
      >
        <h3>控制面板</h3>

        <div style="margin-bottom: 20px">
          <button
            :style="{
              width: '100%',
              padding: '10px',
              background: isAutoPlay ? '#f44336' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }"
            @click="toggleAutoPlay"
          >
            {{ isAutoPlay ? '停止自动流转' : '开始自动流转' }}
          </button>
        </div>

        <div
          v-if="selectedNode"
          style="
            padding: 15px;
            background: #f5f5f5;
            border-radius: 4px;
            margin-bottom: 15px;
          "
        >
          <h4 style="margin-top: 0">
            选中仓库
          </h4>
          <p><strong>名称：</strong>{{ selectedNode.name }}</p>
          <p>
            <strong>库存：</strong>{{ Math.round(selectedNode.dataAmount) }} /
            {{ selectedNode.maxCapacity }}
          </p>
          <p>
            <strong>利用率：</strong>{{
              ((selectedNode.dataAmount / selectedNode.maxCapacity) * 100).toFixed(1)
            }}%
          </p>

          <button
            :disabled="selectedNode.id === 'warehouse-1'"
            :style="{
              width: '100%',
              padding: '8px',
              background: selectedNode.id === 'warehouse-1' ? '#ccc' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedNode.id === 'warehouse-1' ? 'not-allowed' : 'pointer',
            }"
            @click="handleTransfer"
          >
            从中心仓库调货 (50件)
          </button>
        </div>

        <div>
          <h4>仓库统计</h4>
          <div
            v-for="node in nodes"
            :key="node.id"
            style="
              padding: 8px;
              margin-bottom: 8px;
              background: #f9f9f9;
              border-radius: 4px;
              font-size: 12px;
            "
          >
            <div style="font-weight: bold">
              {{ node.name }}
            </div>
            <div>
              库存: {{ Math.round(node.dataAmount) }} / {{ node.maxCapacity }}
            </div>
            <div
              style="
                width: 100%;
                height: 4px;
                background: #e0e0e0;
                border-radius: 2px;
                margin-top: 4px;
                overflow: hidden;
              "
            >
              <div
                :style="{
                  width: `${(node.dataAmount / node.maxCapacity) * 100}%`,
                  height: '100%',
                  background:
                    node.dataAmount / node.maxCapacity > 0.8
                      ? '#f44336'
                      : node.dataAmount / node.maxCapacity > 0.5
                      ? '#ff9800'
                      : '#4CAF50',
                  transition: 'width 0.3s ease',
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 图形展示 -->
      <div style="flex: 1">
        <FlowGraph
          :data="graphData"
          :config="{
            width: 900,
            height: 600,
            enableZoom: true,
            enableDrag: true,
            enableForceSimulation: true,
            particlesPerFlow: 5,
          }"
          :on-node-click="handleNodeClick"
        />
      </div>
    </div>

    <div
      style="
        margin-top: 20px;
        padding: 15px;
        background: #e3f2fd;
        border-radius: 8px;
      "
    >
      <h3>使用说明</h3>
      <ul>
        <li>点击"开始自动流转"查看仓库间自动物流流转</li>
        <li>点击节点选择仓库，查看详细信息</li>
        <li>拖拽节点可调整布局</li>
        <li>使用鼠标滚轮缩放视图</li>
        <li>节点大小表示当前库存量，颜色表示库存水平</li>
        <li>流动的粒子表示货物在运输中</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { FlowGraph } from '@/components/FlowGraph';
import { GraphData, Node, Edge, FlowEvent } from '@/types/graph';
import { generateId } from '@/utils/graphUtils';

// 生成初始仓库数据
const createInitialWarehouses = (): Node[] => {
  return [
    {
      id: 'warehouse-1',
      name: '中心仓库',
      dataAmount: 800,
      maxCapacity: 1000,
      type: 'central',
    },
    {
      id: 'warehouse-2',
      name: '华东仓库',
      dataAmount: 300,
      maxCapacity: 500,
      type: 'regional',
    },
    {
      id: 'warehouse-3',
      name: '华南仓库',
      dataAmount: 450,
      maxCapacity: 500,
      type: 'regional',
    },
    {
      id: 'warehouse-4',
      name: '华北仓库',
      dataAmount: 200,
      maxCapacity: 500,
      type: 'regional',
    },
    {
      id: 'warehouse-5',
      name: '西南仓库',
      dataAmount: 150,
      maxCapacity: 500,
      type: 'regional',
    },
  ];
};

// 生成物流路线
const createLogisticsRoutes = (): Edge[] => {
  return [
    {
      id: 'route-1',
      source: 'warehouse-1',
      target: 'warehouse-2',
      flow: 0,
      capacity: 100,
      speed: 100,
    },
    {
      id: 'route-2',
      source: 'warehouse-1',
      target: 'warehouse-3',
      flow: 0,
      capacity: 100,
      speed: 100,
    },
    {
      id: 'route-3',
      source: 'warehouse-1',
      target: 'warehouse-4',
      flow: 0,
      capacity: 100,
      speed: 100,
    },
    {
      id: 'route-4',
      source: 'warehouse-1',
      target: 'warehouse-5',
      flow: 0,
      capacity: 100,
      speed: 100,
    },
    {
      id: 'route-5',
      source: 'warehouse-2',
      target: 'warehouse-3',
      flow: 0,
      capacity: 50,
      speed: 100,
    },
  ];
};

const nodes = ref<Node[]>(createInitialWarehouses());
const edges = ref<Edge[]>(createLogisticsRoutes());
const flowEvents = ref<FlowEvent[]>([]);
const selectedNode = ref<Node | null>(null);
const isAutoPlay = ref(false);
let autoPlayInterval: number | null = null;

const graphData = computed<GraphData>(() => ({
  nodes: nodes.value,
  edges: edges.value,
  flowEvents: flowEvents.value,
}));

const toggleAutoPlay = () => {
  isAutoPlay.value = !isAutoPlay.value;
};

// 自动生成物流流动
watch(isAutoPlay, (value) => {
  if (value) {
    autoPlayInterval = window.setInterval(() => {
      // 随机选择一条路线
      const randomEdge = edges.value[Math.floor(Math.random() * edges.value.length)];
      const amount = 20 + Math.random() * 50;

      // 创建流动事件
      const flowEvent: FlowEvent = {
        id: generateId('flow'),
        edgeId: randomEdge.id,
        amount,
        startTime: Date.now(),
        duration: 2000,
        status: 'pending',
      };

      flowEvents.value = [...flowEvents.value, flowEvent];

      // 2秒后更新节点数据
      setTimeout(() => {
        nodes.value = nodes.value.map((node) => {
          if (node.id === randomEdge.source) {
            return {
              ...node,
              dataAmount: Math.max(0, node.dataAmount - amount),
            };
          }
          if (node.id === randomEdge.target) {
            return {
              ...node,
              dataAmount: Math.min(node.maxCapacity, node.dataAmount + amount),
            };
          }
          return node;
        });

        // 移除已完成的流动事件
        flowEvents.value = flowEvents.value.filter((e) => e.id !== flowEvent.id);
      }, 2000);
    }, 3000);
  } else {
    if (autoPlayInterval !== null) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }
});

onUnmounted(() => {
  if (autoPlayInterval !== null) {
    clearInterval(autoPlayInterval);
  }
});

const handleNodeClick = (node: Node) => {
  selectedNode.value = node;
};

const handleTransfer = () => {
  if (!selectedNode.value) return;

  // 从中心仓库向选中的仓库发货
  const edge = edges.value.find(
    (e) => e.source === 'warehouse-1' && e.target === selectedNode.value!.id
  );

  if (!edge) {
    alert('该仓库没有直接物流路线');
    return;
  }

  const amount = 50;

  const flowEvent: FlowEvent = {
    id: generateId('flow'),
    edgeId: edge.id,
    amount,
    startTime: Date.now(),
    duration: 2000,
    status: 'pending',
  };

  flowEvents.value = [...flowEvents.value, flowEvent];

  // 2秒后更新数据
  setTimeout(() => {
    nodes.value = nodes.value.map((node) => {
      if (node.id === 'warehouse-1') {
        return { ...node, dataAmount: node.dataAmount - amount };
      }
      if (node.id === selectedNode.value!.id) {
        return {
          ...node,
          dataAmount: Math.min(node.maxCapacity, node.dataAmount + amount),
        };
      }
      return node;
    });

    flowEvents.value = flowEvents.value.filter((e) => e.id !== flowEvent.id);
  }, 2000);
};
</script>
