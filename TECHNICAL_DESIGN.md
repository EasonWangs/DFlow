# 数据流可视化技术方案

## 1. 概述

本项目旨在实现一个动态数据流可视化系统，能够：
- 展示节点之间的拓扑关系
- 实时显示节点间的数据流动动画
- 节点大小随数据量动态变化
- 适用于仓库库存、物流网络等场景

## 2. 技术栈

### 2.1 前端框架
- **React 18** - 组件化UI开发
- **TypeScript** - 类型安全，提高代码质量
- **Vite** - 快速的开发构建工具

### 2.2 可视化库
- **D3.js v7** - 强大的数据驱动文档库
  - 用于节点和边的渲染
  - 力导向布局算法
  - 流畅的过渡动画

### 2.3 状态管理
- **React Context + useReducer** - 轻量级状态管理
- **Zustand**（可选）- 更复杂场景下的状态管理

### 2.4 样式方案
- **CSS Modules** / **Tailwind CSS** - 样式隔离和快速开发

## 3. 核心功能模块

### 3.1 数据模型

```typescript
// 节点数据结构
interface Node {
  id: string;              // 唯一标识
  name: string;            // 节点名称
  dataAmount: number;      // 当前数据量（决定节点大小）
  maxCapacity: number;     // 最大容量
  position?: {             // 位置（可选，用于固定布局）
    x: number;
    y: number;
  };
  type?: string;           // 节点类型（如：仓库、中转站等）
  metadata?: Record<string, any>; // 扩展元数据
}

// 边/连接数据结构
interface Edge {
  id: string;              // 唯一标识
  source: string;          // 源节点ID
  target: string;          // 目标节点ID
  flow: number;            // 当前流量
  capacity?: number;       // 最大容量
  speed?: number;          // 流动速度
}

// 流动事件
interface FlowEvent {
  id: string;              // 事件ID
  edgeId: string;          // 关联的边
  amount: number;          // 流动数量
  startTime: number;       // 开始时间
  duration: number;        // 持续时间（ms）
  status: 'pending' | 'active' | 'completed';
}

// 图数据
interface GraphData {
  nodes: Node[];
  edges: Edge[];
  flowEvents: FlowEvent[];
}
```

### 3.2 渲染引擎

#### 3.2.1 节点渲染
- 使用 D3.js 的 `selection` 和 `data binding`
- 节点大小根据 `dataAmount` 计算：`radius = baseRadius + scale(dataAmount)`
- 颜色编码表示状态（空闲/繁忙/告警）
- 平滑的过渡动画使用 `d3.transition()`

#### 3.2.2 边渲染
- 使用 SVG `path` 绘制曲线连接
- 边的粗细表示容量或当前流量
- 支持直线、曲线、折线等多种样式

#### 3.2.3 流动动画
- 使用 SVG `circle` 或 `marker` 沿路径运动
- 通过 D3 的 `transition()` 或 CSS 动画实现
- 流动粒子的大小和数量表示流量大小

### 3.3 布局算法

支持多种布局方式：

1. **力导向布局**（Force-Directed Layout）
   - 使用 `d3-force` 实现
   - 自动计算最优节点位置
   - 支持自定义力（重力、排斥力、链接力）

2. **层次布局**（Hierarchical Layout）
   - 树形或DAG结构
   - 适合有明确层级的数据流

3. **自定义布局**
   - 允许用户手动拖拽调整位置
   - 保存布局配置

### 3.4 动画系统

```typescript
class FlowAnimationEngine {
  // 添加流动事件
  addFlowEvent(event: FlowEvent): void;

  // 更新节点数据量
  updateNodeData(nodeId: string, newAmount: number, duration: number): void;

  // 动画帧更新
  tick(deltaTime: number): void;

  // 启动/暂停动画
  start(): void;
  pause(): void;
}
```

实现要点：
- 使用 `requestAnimationFrame` 实现流畅动画
- 支持同时运行多个流动动画
- 动画完成后触发节点数据量更新
- 平滑的节点缩放过渡

### 3.5 交互功能

1. **拖拽**
   - 节点可拖拽调整位置
   - 画布平移和缩放（Pan & Zoom）

2. **Tooltip**
   - 鼠标悬停显示节点/边的详细信息
   - 当前数据量、流量、容量利用率等

3. **点击事件**
   - 选中节点高亮显示
   - 显示详情面板
   - 触发自定义事件

4. **缩放控制**
   - 使用 `d3-zoom` 实现
   - 支持鼠标滚轮和缩放按钮

## 4. 架构设计

### 4.1 组件结构

```
src/
├── components/
│   ├── FlowGraph/              # 主图组件
│   │   ├── index.tsx
│   │   ├── Node.tsx            # 节点组件
│   │   ├── Edge.tsx            # 边组件
│   │   ├── FlowParticle.tsx    # 流动粒子
│   │   └── styles.module.css
│   ├── Controls/               # 控制面板
│   │   ├── ZoomControls.tsx
│   │   └── LayoutControls.tsx
│   └── InfoPanel/              # 信息面板
│       └── index.tsx
├── hooks/
│   ├── useD3.ts                # D3初始化hook
│   ├── useFlowAnimation.ts     # 动画控制hook
│   └── useGraphLayout.ts       # 布局计算hook
├── engine/
│   ├── FlowAnimationEngine.ts  # 动画引擎
│   ├── LayoutEngine.ts         # 布局引擎
│   └── EventManager.ts         # 事件管理
├── types/
│   └── graph.ts                # 类型定义
├── utils/
│   ├── graphUtils.ts           # 图计算工具
│   └── animationUtils.ts       # 动画工具
└── examples/
    └── WarehouseLogistics.tsx  # 仓库物流示例
```

### 4.2 数据流

```
用户操作/数据更新
    ↓
状态管理（Context/Zustand）
    ↓
React组件更新
    ↓
D3渲染引擎
    ↓
SVG DOM更新
```

## 5. 性能优化

### 5.1 渲染优化
- 使用 `React.memo` 减少不必要的重渲染
- 虚拟化：大量节点时只渲染可见区域
- 使用 `Canvas` 替代 `SVG`（节点数 > 1000时）

### 5.2 动画优化
- 使用 `requestAnimationFrame` 控制帧率
- 批量更新 DOM
- GPU加速：使用 `transform` 而非 `left/top`

### 5.3 数据优化
- 防抖/节流处理频繁更新
- 增量更新而非全量重渲染
- Web Worker 处理复杂计算（布局算法）

## 6. 扩展性设计

### 6.1 插件系统
```typescript
interface Plugin {
  name: string;
  onNodeClick?: (node: Node) => void;
  onEdgeClick?: (edge: Edge) => void;
  customRenderer?: (ctx: RenderContext) => void;
}
```

### 6.2 主题系统
- 支持自定义颜色方案
- 暗色/亮色模式
- 可配置的样式参数

### 6.3 数据适配器
```typescript
interface DataAdapter {
  fetchNodes(): Promise<Node[]>;
  fetchEdges(): Promise<Edge[]>;
  subscribeToUpdates(callback: (update: GraphUpdate) => void): void;
}
```

## 7. 应用场景示例：仓库物流

### 7.1 数据模型映射
- **节点** = 仓库/配送中心
- **节点大小** = 当前库存量
- **边** = 物流路线
- **流动动画** = 货物运输

### 7.2 功能特性
- 实时显示各仓库库存水平
- 动画展示货物在仓库间的流转
- 告警：库存不足或过载
- 统计面板：总库存、运输中货物等

### 7.3 数据更新机制
1. **实时模式**：WebSocket 接收实时数据
2. **轮询模式**：定时请求更新
3. **模拟模式**：生成随机数据用于演示

## 8. 开发计划

### Phase 1: 基础框架（1-2周）
- [x] 项目初始化
- [ ] 基础组件结构
- [ ] D3.js 集成
- [ ] 类型定义

### Phase 2: 核心功能（2-3周）
- [ ] 节点和边渲染
- [ ] 力导向布局
- [ ] 基础交互（拖拽、缩放）

### Phase 3: 动画系统（2周）
- [ ] 流动动画引擎
- [ ] 节点动态缩放
- [ ] 平滑过渡效果

### Phase 4: 示例应用（1周）
- [ ] 仓库物流示例
- [ ] 模拟数据生成器
- [ ] 文档和演示

### Phase 5: 优化和扩展（持续）
- [ ] 性能优化
- [ ] 更多布局算法
- [ ] 插件系统

## 9. 技术难点和解决方案

### 9.1 流动动画的流畅性
**挑战**：多个流动动画同时运行时性能问题
**解决方案**：
- 使用对象池管理粒子
- 限制同时运行的动画数量
- 根据设备性能动态调整粒子数量

### 9.2 节点大小变化与布局稳定性
**挑战**：节点缩放可能导致布局抖动
**解决方案**：
- 使用阻尼函数平滑缩放
- 调整力导向算法的参数
- 提供"锁定布局"选项

### 9.3 大规模图的性能
**挑战**：节点数 > 500 时性能下降
**解决方案**：
- Canvas 渲染替代 SVG
- 实现视口裁剪
- LOD（Level of Detail）技术

## 10. 测试策略

- **单元测试**：Jest + React Testing Library
- **视觉回归测试**：Storybook + Chromatic
- **性能测试**：Lighthouse + 自定义性能指标
- **E2E测试**：Playwright

## 11. 部署方案

- **开发环境**：Vite dev server
- **生产构建**：Vite build
- **托管**：GitHub Pages / Vercel / Netlify
- **CDN**：静态资源加速

## 12. 参考资料

- [D3.js 官方文档](https://d3js.org/)
- [Force Simulation](https://github.com/d3/d3-force)
- [React + D3 最佳实践](https://2019.wattenberger.com/blog/react-and-d3)
- [Data Flow Visualization Examples](https://observablehq.com/@d3/gallery)
