<template>
  <div style="padding: 20px; font-family: Arial, sans-serif; background: #f5f5f5">
    <h1 style="text-align: center; color: #333; margin-bottom: 10px">
      动画引擎对比：原生 RAF vs Anime.js
    </h1>
    <p style="text-align: center; color: #666; margin-bottom: 30px">
      概念验证（POC）- 对比两种动画实现的效果和性能
    </p>

    <!-- 控制面板 -->
    <div
      style="
        max-width: 1800px;
        margin: 0 auto 20px;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      "
    >
      <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: center">
        <button
          :style="{
            padding: '12px 24px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }"
          @click="triggerSingleFlow"
        >
          触发单次流动
        </button>

        <button
          :style="{
            padding: '12px 24px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }"
          @click="triggerMultipleFlows"
        >
          触发多个流动
        </button>

        <button
          :style="{
            padding: '12px 24px',
            background: isAutoPlay ? '#f44336' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }"
          @click="toggleAutoPlay"
        >
          {{ isAutoPlay ? '停止自动流转' : '开始自动流转' }}
        </button>

        <div style="margin-left: auto; color: #666">
          <strong>性能指标：</strong>
          <span style="margin-left: 10px">FPS: {{ fps }}</span>
          <span style="margin-left: 10px">活跃粒子: {{ activeParticles }}</span>
        </div>
      </div>
    </div>

    <!-- 对比视图 -->
    <div
      style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        max-width: 1800px;
        margin: 0 auto;
      "
    >
      <!-- 原生 RAF 实现 -->
      <div
        style="
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        "
      >
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
          "
        >
          <h2 style="margin: 0; color: #333">
            原生 RequestAnimationFrame
          </h2>
          <span
            style="
              padding: 6px 12px;
              background: #e3f2fd;
              color: #1976d2;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            "
          >
            当前实现
          </span>
        </div>
        <FlowGraph
          :data="graphDataNative"
          :config="{
            width: 800,
            height: 500,
            enableZoom: true,
            enableDrag: true,
            enableForceSimulation: true,
            particlesPerFlow: 5,
          }"
        />
        <div style="margin-top: 15px; padding: 10px; background: #f9f9f9; border-radius: 4px">
          <strong>特点：</strong>
          <ul style="margin: 5px 0; padding-left: 20px; font-size: 13px">
            <li>手动管理动画循环</li>
            <li>完全控制动画逻辑</li>
            <li>零外部依赖</li>
          </ul>
        </div>
      </div>

      <!-- Anime.js 实现 -->
      <div
        style="
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        "
      >
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
          "
        >
          <h2 style="margin: 0; color: #333">
            Anime.js
          </h2>
          <span
            style="
              padding: 6px 12px;
              background: #fff3e0;
              color: #f57c00;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            "
          >
            POC 测试
          </span>
        </div>
        <AnimeFlowGraph
          :data="graphDataAnime"
          :config="{
            width: 800,
            height: 500,
            enableZoom: true,
            enableDrag: true,
            enableForceSimulation: true,
            particlesPerFlow: 5,
          }"
        />
        <div style="margin-top: 15px; padding: 10px; background: #f9f9f9; border-radius: 4px">
          <strong>特点：</strong>
          <ul style="margin: 5px 0; padding-left: 20px; font-size: 13px">
            <li>声明式动画 API</li>
            <li>内置丰富缓动函数</li>
            <li>自动性能优化</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 对比说明 -->
    <div
      style="
        max-width: 1800px;
        margin: 30px auto 0;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      "
    >
      <h3 style="margin-top: 0">📊 对比评估</h3>
      <table style="width: 100%; border-collapse: collapse">
        <thead>
          <tr style="background: #f5f5f5">
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd">维度</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd">原生 RAF</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd">Anime.js</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd"><strong>代码量</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd">~250 行</td>
            <td style="padding: 12px; border: 1px solid #ddd">~200 行</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd"><strong>包大小</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd">0 KB</td>
            <td style="padding: 12px; border: 1px solid #ddd">+6.6 KB (gzipped)</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd"><strong>易用性</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd">需要手动管理</td>
            <td style="padding: 12px; border: 1px solid #ddd">声明式 API，更简洁</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd"><strong>缓动函数</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd">自己实现（1 个）</td>
            <td style="padding: 12px; border: 1px solid #ddd">内置 40+ 种</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd"><strong>调试</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd">需要 console.log</td>
            <td style="padding: 12px; border: 1px solid #ddd">更好的错误提示</td>
          </tr>
        </tbody>
      </table>

      <h3 style="margin-top: 30px">🎯 测试建议</h3>
      <ol>
        <li><strong>单次流动：</strong>点击"触发单次流动"，观察两边动画是否同步</li>
        <li><strong>多个流动：</strong>点击"触发多个流动"，观察大量粒子时的性能</li>
        <li><strong>自动流转：</strong>开启自动流转，长时间观察稳定性</li>
        <li><strong>交互测试：</strong>拖拽节点，查看动画是否流畅</li>
      </ol>

      <h3 style="margin-top: 30px">💡 结论参考</h3>
      <p>根据你的测试体验，可以考虑：</p>
      <ul>
        <li>
          <strong>保持当前方案：</strong>如果两者效果相同，原生实现已足够好
        </li>
        <li>
          <strong>采用 Anime.js：</strong>如果觉得 Anime.js 更易维护，且不介意增加 6.6KB
        </li>
        <li>
          <strong>混合使用：</strong>部分场景使用 Anime.js（如节点数据变化），粒子继续用原生
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { FlowGraph } from '@/components/FlowGraph';
import AnimeFlowGraph from './components/AnimeFlowGraph.vue';
import { GraphData, Node, Edge, FlowEvent } from '@/types/graph';
import { generateId } from '@/utils/graphUtils';

// 创建测试数据
const createTestNodes = (): Node[] => {
  return [
    { id: 'node-1', name: '节点 A', dataAmount: 800, maxCapacity: 1000, type: 'source' },
    { id: 'node-2', name: '节点 B', dataAmount: 300, maxCapacity: 500, type: 'target' },
    { id: 'node-3', name: '节点 C', dataAmount: 450, maxCapacity: 500, type: 'target' },
    { id: 'node-4', name: '节点 D', dataAmount: 200, maxCapacity: 500, type: 'target' },
  ];
};

const createTestEdges = (): Edge[] => {
  return [
    { id: 'edge-1', source: 'node-1', target: 'node-2', flow: 0, capacity: 100, speed: 100 },
    { id: 'edge-2', source: 'node-1', target: 'node-3', flow: 0, capacity: 100, speed: 100 },
    { id: 'edge-3', source: 'node-1', target: 'node-4', flow: 0, capacity: 100, speed: 100 },
    { id: 'edge-4', source: 'node-2', target: 'node-3', flow: 0, capacity: 50, speed: 100 },
  ];
};

const nodesNative = ref<Node[]>(createTestNodes());
const edgesNative = ref<Edge[]>(createTestEdges());
const flowEventsNative = ref<FlowEvent[]>([]);

const nodesAnime = ref<Node[]>(createTestNodes());
const edgesAnime = ref<Edge[]>(createTestEdges());
const flowEventsAnime = ref<FlowEvent[]>([]);

const isAutoPlay = ref(false);
const fps = ref(60);
const activeParticles = ref(0);

let autoPlayInterval: number | null = null;

const graphDataNative = computed<GraphData>(() => ({
  nodes: nodesNative.value,
  edges: edgesNative.value,
  flowEvents: flowEventsNative.value,
}));

const graphDataAnime = computed<GraphData>(() => ({
  nodes: nodesAnime.value,
  edges: edgesAnime.value,
  flowEvents: flowEventsAnime.value,
}));

// 触发单次流动
const triggerSingleFlow = () => {
  const edge = edgesNative.value[0];
  const amount = 30 + Math.random() * 40;

  const flowEvent: FlowEvent = {
    id: generateId('flow'),
    edgeId: edge.id,
    amount,
    startTime: Date.now(),
    duration: 2000,
    status: 'pending',
  };

  // 同时触发两边
  flowEventsNative.value = [...flowEventsNative.value, { ...flowEvent }];
  flowEventsAnime.value = [...flowEventsAnime.value, { ...flowEvent, id: generateId('flow') }];

  // 2秒后清理
  setTimeout(() => {
    flowEventsNative.value = flowEventsNative.value.filter((e) => e.id !== flowEvent.id);
  }, 2000);
  setTimeout(() => {
    flowEventsAnime.value = flowEventsAnime.value.filter(
      (e) => e.startTime !== flowEvent.startTime
    );
  }, 2000);
};

// 触发多个流动
const triggerMultipleFlows = () => {
  edgesNative.value.forEach((edge, i) => {
    setTimeout(() => {
      const amount = 20 + Math.random() * 30;
      const flowEvent: FlowEvent = {
        id: generateId('flow'),
        edgeId: edge.id,
        amount,
        startTime: Date.now(),
        duration: 2000,
        status: 'pending',
      };

      flowEventsNative.value = [...flowEventsNative.value, { ...flowEvent }];
      flowEventsAnime.value = [
        ...flowEventsAnime.value,
        { ...flowEvent, id: generateId('flow') },
      ];

      setTimeout(() => {
        flowEventsNative.value = flowEventsNative.value.filter((e) => e.id !== flowEvent.id);
      }, 2000);
      setTimeout(() => {
        flowEventsAnime.value = flowEventsAnime.value.filter(
          (e) => e.startTime !== flowEvent.startTime
        );
      }, 2000);
    }, i * 200);
  });
};

// 自动播放
const toggleAutoPlay = () => {
  isAutoPlay.value = !isAutoPlay.value;
};

watch(isAutoPlay, (value) => {
  if (value) {
    autoPlayInterval = window.setInterval(() => {
      const randomEdge = edgesNative.value[Math.floor(Math.random() * edgesNative.value.length)];
      const amount = 20 + Math.random() * 50;

      const flowEvent: FlowEvent = {
        id: generateId('flow'),
        edgeId: randomEdge.id,
        amount,
        startTime: Date.now(),
        duration: 2000,
        status: 'pending',
      };

      flowEventsNative.value = [...flowEventsNative.value, { ...flowEvent }];
      flowEventsAnime.value = [
        ...flowEventsAnime.value,
        { ...flowEvent, id: generateId('flow') },
      ];

      setTimeout(() => {
        flowEventsNative.value = flowEventsNative.value.filter((e) => e.id !== flowEvent.id);
      }, 2000);
      setTimeout(() => {
        flowEventsAnime.value = flowEventsAnime.value.filter(
          (e) => e.startTime !== flowEvent.startTime
        );
      }, 2000);
    }, 1500);
  } else {
    if (autoPlayInterval !== null) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }
});

// FPS 计算
let lastTime = performance.now();
let frames = 0;
const updateFPS = () => {
  frames++;
  const now = performance.now();
  if (now >= lastTime + 1000) {
    fps.value = Math.round((frames * 1000) / (now - lastTime));
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(updateFPS);
};

onMounted(() => {
  updateFPS();
});

onUnmounted(() => {
  if (autoPlayInterval !== null) {
    clearInterval(autoPlayInterval);
  }
});
</script>
