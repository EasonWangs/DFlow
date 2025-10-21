/**
 * 核心数据类型定义
 */

// 节点位置
export interface Position {
  x: number;
  y: number;
}

// 节点数据结构
export interface Node {
  id: string;              // 唯一标识
  name: string;            // 节点名称
  dataAmount: number;      // 当前数据量（决定节点大小）
  maxCapacity: number;     // 最大容量
  position?: Position;     // 位置（可选，用于固定布局）
  type?: string;           // 节点类型（如：仓库、中转站等）
  metadata?: Record<string, any>; // 扩展元数据
}

// 边/连接数据结构
export interface Edge {
  id: string;              // 唯一标识
  source: string;          // 源节点ID
  target: string;          // 目标节点ID
  flow: number;            // 当前流量
  capacity?: number;       // 最大容量
  speed?: number;          // 流动速度（像素/秒）
}

// 流动事件状态
export type FlowEventStatus = 'pending' | 'active' | 'completed';

// 流动事件
export interface FlowEvent {
  id: string;              // 事件ID
  edgeId: string;          // 关联的边
  amount: number;          // 流动数量
  startTime: number;       // 开始时间（时间戳）
  duration: number;        // 持续时间（ms）
  status: FlowEventStatus;
  progress?: number;       // 进度 (0-1)
}

// 图数据
export interface GraphData {
  nodes: Node[];
  edges: Edge[];
  flowEvents: FlowEvent[];
}

// D3 力导向模拟中的节点（扩展了位置和速度信息）
export interface SimulationNode extends Node {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

// D3 力导向模拟中的边
export interface SimulationEdge extends Edge {
  source: SimulationNode | string;
  target: SimulationNode | string;
}

// 节点样式配置
export interface NodeStyle {
  minRadius: number;       // 最小半径
  maxRadius: number;       // 最大半径
  fillColor: string;       // 填充颜色
  strokeColor: string;     // 边框颜色
  strokeWidth: number;     // 边框宽度
  opacity: number;         // 透明度
}

// 边样式配置
export interface EdgeStyle {
  strokeColor: string;     // 线条颜色
  strokeWidth: number;     // 线条宽度
  opacity: number;         // 透明度
  animated: boolean;       // 是否显示流动动画
}

// 流动粒子
export interface FlowParticle {
  id: string;
  edgeId: string;
  progress: number;        // 0-1 之间
  size: number;
  color: string;
}

// 图配置
export interface GraphConfig {
  width: number;
  height: number;
  nodeStyle: Partial<NodeStyle>;
  edgeStyle: Partial<EdgeStyle>;
  enableZoom: boolean;
  enableDrag: boolean;
  enableForceSimulation: boolean;
  particlesPerFlow: number; // 每个流动事件的粒子数量
}

// 布局类型
export type LayoutType = 'force' | 'hierarchical' | 'circular' | 'custom';

// 事件回调
export interface GraphEvents {
  onNodeClick?: (node: Node) => void;
  onNodeHover?: (node: Node | null) => void;
  onEdgeClick?: (edge: Edge) => void;
  onEdgeHover?: (edge: Edge | null) => void;
  onFlowComplete?: (event: FlowEvent) => void;
}

// 图更新
export interface GraphUpdate {
  type: 'node' | 'edge' | 'flow';
  action: 'add' | 'update' | 'remove';
  data: Node | Edge | FlowEvent;
}
