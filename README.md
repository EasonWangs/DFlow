# DFlow - 数据流可视化库

一个基于 React + D3.js 的动态数据流可视化库，用于展示节点之间的拓扑关系和数据流动。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![D3](https://img.shields.io/badge/d3-7.8.5-orange.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.2.2-blue.svg)

## 特性

- **动态节点大小**：节点大小随数据量实时变化
- **流动动画**：数据在节点间流动的粒子动画效果
- **多种布局**：支持力导向、层次、环形等多种布局算法
- **丰富交互**：节点拖拽、画布缩放、点击事件等
- **高性能**：基于 D3.js 优化的渲染引擎
- **TypeScript**：完整的类型定义支持
- **易于扩展**：模块化设计，支持自定义样式和行为

## 在线演示

查看 [仓库物流示例](src/examples/WarehouseLogistics.tsx) 了解如何使用。

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

在浏览器中访问 `http://localhost:3000` 查看示例。

### 构建生产版本

```bash
npm run build
```

## 使用示例

### 基本用法

```typescript
import { FlowGraph } from './components/FlowGraph';
import { GraphData } from './types/graph';

const data: GraphData = {
  nodes: [
    {
      id: 'node-1',
      name: '节点1',
      dataAmount: 100,
      maxCapacity: 200,
    },
    {
      id: 'node-2',
      name: '节点2',
      dataAmount: 50,
      maxCapacity: 200,
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
      flow: 10,
      capacity: 50,
    },
  ],
  flowEvents: [],
};

function App() {
  return (
    <FlowGraph
      data={data}
      config={{
        width: 800,
        height: 600,
        enableZoom: true,
        enableDrag: true,
      }}
      onNodeClick={(node) => console.log('Clicked:', node)}
    />
  );
}
```

### 添加流动动画

```typescript
import { FlowEvent } from './types/graph';

const flowEvent: FlowEvent = {
  id: 'flow-1',
  edgeId: 'edge-1',
  amount: 20,
  startTime: Date.now(),
  duration: 2000,
  status: 'pending',
};

// 将 flowEvent 添加到 GraphData.flowEvents 数组中
```

## 核心概念

### 数据模型

#### Node（节点）

```typescript
interface Node {
  id: string;              // 唯一标识
  name: string;            // 节点名称
  dataAmount: number;      // 当前数据量
  maxCapacity: number;     // 最大容量
  position?: Position;     // 可选的固定位置
  type?: string;           // 节点类型
  metadata?: any;          // 扩展数据
}
```

#### Edge（边）

```typescript
interface Edge {
  id: string;              // 唯一标识
  source: string;          // 源节点ID
  target: string;          // 目标节点ID
  flow: number;            // 当前流量
  capacity?: number;       // 最大容量
  speed?: number;          // 流动速度
}
```

#### FlowEvent（流动事件）

```typescript
interface FlowEvent {
  id: string;              // 事件ID
  edgeId: string;          // 关联的边
  amount: number;          // 流动数量
  startTime: number;       // 开始时间
  duration: number;        // 持续时间（ms）
  status: 'pending' | 'active' | 'completed';
}
```

### 配置选项

```typescript
interface GraphConfig {
  width: number;                    // 画布宽度
  height: number;                   // 画布高度
  nodeStyle: {
    minRadius: number;              // 节点最小半径
    maxRadius: number;              // 节点最大半径
    fillColor: string;              // 填充颜色
    strokeColor: string;            // 边框颜色
    strokeWidth: number;            // 边框宽度
    opacity: number;                // 透明度
  };
  edgeStyle: {
    strokeColor: string;            // 线条颜色
    strokeWidth: number;            // 线条宽度
    opacity: number;                // 透明度
    animated: boolean;              // 是否显示流动动画
  };
  enableZoom: boolean;              // 启用缩放
  enableDrag: boolean;              // 启用拖拽
  enableForceSimulation: boolean;   // 启用力导向布局
  particlesPerFlow: number;         // 每个流动事件的粒子数量
}
```

## 应用场景

### 1. 仓库物流

- 展示多个仓库之间的库存分布
- 实时显示货物流转动画
- 监控库存水平和容量利用率

### 2. 数据中心流量

- 可视化服务器之间的数据传输
- 监控网络带宽使用情况
- 识别流量瓶颈

### 3. 资金流转

- 展示账户之间的资金流动
- 追踪交易路径
- 分析资金流向

### 4. 供应链管理

- 可视化供应商到客户的货物流动
- 监控供应链效率
- 优化物流路线

## 架构设计

```
src/
├── components/         # React 组件
│   └── FlowGraph/     # 主图组件
├── engine/            # 核心引擎
│   ├── FlowAnimationEngine.ts  # 动画引擎
│   └── LayoutEngine.ts         # 布局引擎
├── hooks/             # React Hooks
│   └── useFlowGraph.ts
├── types/             # TypeScript 类型定义
│   └── graph.ts
├── utils/             # 工具函数
│   └── graphUtils.ts
└── examples/          # 示例应用
    └── WarehouseLogistics.tsx
```

## 性能优化

- 使用 `requestAnimationFrame` 实现流畅动画
- D3.js 力导向模拟优化
- React 组件记忆化
- 大规模节点时可切换到 Canvas 渲染

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

需要支持 ES2020 和 SVG。

## 开发计划

- [x] 基础图形渲染
- [x] 流动动画系统
- [x] 节点动态缩放
- [x] 力导向布局
- [x] 仓库物流示例
- [ ] 更多布局算法（层次、环形）
- [ ] Canvas 渲染模式
- [ ] 性能监控面板
- [ ] 更多示例场景
- [ ] 单元测试
- [ ] 文档站点

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **D3.js v7** - 数据可视化
- **Vite** - 构建工具
- **Zustand** - 状态管理（可选）

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 参考资料

- [D3.js 官方文档](https://d3js.org/)
- [React + D3 最佳实践](https://2019.wattenberger.com/blog/react-and-d3)
- [Force Simulation](https://github.com/d3/d3-force)
- [技术设计文档](./TECHNICAL_DESIGN.md)

## 联系方式

如有问题或建议，欢迎提交 Issue。
