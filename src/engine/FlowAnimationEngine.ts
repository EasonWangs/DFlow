/**
 * 流动画引擎
 * 管理数据流动动画和节点数据量的动态变化
 */

import { FlowEvent, FlowParticle, Node } from '../types/graph';

export class FlowAnimationEngine {
  private flowEvents: Map<string, FlowEvent> = new Map();
  private particles: Map<string, FlowParticle[]> = new Map();
  private nodes: Map<string, Node> = new Map();
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private isRunning: boolean = false;
  private particlesPerFlow: number = 3;

  // 事件监听器
  private listeners: {
    onFlowComplete?: (event: FlowEvent) => void;
    onNodeUpdate?: (node: Node) => void;
    onParticlesUpdate?: (particles: FlowParticle[]) => void;
  } = {};

  constructor(particlesPerFlow: number = 3) {
    this.particlesPerFlow = particlesPerFlow;
  }

  /**
   * 设置节点数据
   */
  setNodes(nodes: Node[]): void {
    this.nodes.clear();
    nodes.forEach(node => {
      this.nodes.set(node.id, { ...node });
    });
  }

  /**
   * 添加流动事件
   */
  addFlowEvent(event: FlowEvent): void {
    const flowEvent: FlowEvent = {
      ...event,
      status: 'pending',
      progress: 0,
      startTime: Date.now(),
    };
    this.flowEvents.set(event.id, flowEvent);

    // 创建粒子
    const particles: FlowParticle[] = [];
    for (let i = 0; i < this.particlesPerFlow; i++) {
      particles.push({
        id: `${event.id}-particle-${i}`,
        edgeId: event.edgeId,
        progress: i / this.particlesPerFlow, // 均匀分布
        size: 4 + Math.random() * 2,
        color: this.getFlowColor(event.amount),
      });
    }
    this.particles.set(event.id, particles);
  }

  /**
   * 移除流动事件
   */
  removeFlowEvent(eventId: string): void {
    this.flowEvents.delete(eventId);
    this.particles.delete(eventId);
  }

  /**
   * 更新节点数据量
   */
  updateNodeData(nodeId: string, newAmount: number, duration: number = 500): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    const oldAmount = node.dataAmount;
    const startTime = Date.now();

    // 使用缓动函数平滑过渡
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = this.easeInOutCubic(progress);

      node.dataAmount = oldAmount + (newAmount - oldAmount) * easedProgress;

      if (this.listeners.onNodeUpdate) {
        this.listeners.onNodeUpdate({ ...node });
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * 启动动画
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.tick(this.lastTimestamp);
  }

  /**
   * 暂停动画
   */
  pause(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 动画帧更新
   */
  private tick(timestamp: number): void {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.updateFlowEvents(deltaTime);
    this.updateParticles(deltaTime);

    // 通知粒子更新
    if (this.listeners.onParticlesUpdate) {
      const allParticles = Array.from(this.particles.values()).flat();
      this.listeners.onParticlesUpdate(allParticles);
    }

    this.animationFrameId = requestAnimationFrame((ts) => this.tick(ts));
  }

  /**
   * 更新流动事件
   */
  private updateFlowEvents(deltaTime: number): void {
    const completedEvents: FlowEvent[] = [];

    this.flowEvents.forEach((event) => {
      if (event.status === 'completed') return;

      const elapsed = Date.now() - event.startTime;
      event.progress = Math.min(elapsed / event.duration, 1);

      if (event.status === 'pending' && event.progress > 0) {
        event.status = 'active';
      }

      if (event.progress >= 1) {
        event.status = 'completed';
        completedEvents.push(event);
      }
    });

    // 处理完成的事件
    completedEvents.forEach((event) => {
      this.handleFlowComplete(event);
    });
  }

  /**
   * 更新粒子位置
   */
  private updateParticles(deltaTime: number): void {
    this.particles.forEach((particles, eventId) => {
      const event = this.flowEvents.get(eventId);
      if (!event || event.status === 'completed') return;

      particles.forEach((particle) => {
        // 粒子速度基于事件持续时间
        const speed = 1 / event.duration;
        particle.progress += speed * deltaTime;

        // 粒子循环
        if (particle.progress > 1) {
          particle.progress = 0;
        }
      });
    });
  }

  /**
   * 处理流动完成
   */
  private handleFlowComplete(event: FlowEvent): void {
    // 通知监听器
    if (this.listeners.onFlowComplete) {
      this.listeners.onFlowComplete(event);
    }

    // 清理粒子
    this.particles.delete(event.id);
    this.flowEvents.delete(event.id);
  }

  /**
   * 获取流动颜色
   */
  private getFlowColor(amount: number): string {
    // 根据流量大小返回不同颜色
    if (amount > 100) return '#ff4444';
    if (amount > 50) return '#ff9944';
    return '#44aaff';
  }

  /**
   * 缓动函数：三次方缓入缓出
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * 获取所有活跃的粒子
   */
  getParticles(): FlowParticle[] {
    return Array.from(this.particles.values()).flat();
  }

  /**
   * 获取所有流动事件
   */
  getFlowEvents(): FlowEvent[] {
    return Array.from(this.flowEvents.values());
  }

  /**
   * 设置事件监听器
   */
  on(event: 'flowComplete', handler: (event: FlowEvent) => void): void;
  on(event: 'nodeUpdate', handler: (node: Node) => void): void;
  on(event: 'particlesUpdate', handler: (particles: FlowParticle[]) => void): void;
  on(event: string, handler: any): void {
    if (event === 'flowComplete') {
      this.listeners.onFlowComplete = handler;
    } else if (event === 'nodeUpdate') {
      this.listeners.onNodeUpdate = handler;
    } else if (event === 'particlesUpdate') {
      this.listeners.onParticlesUpdate = handler;
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.pause();
    this.flowEvents.clear();
    this.particles.clear();
    this.nodes.clear();
    this.listeners = {};
  }
}
