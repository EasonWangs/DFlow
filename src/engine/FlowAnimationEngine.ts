/**
 * 流动画引擎（基于 Anime.js）
 * 管理数据流动动画和节点数据量的动态变化
 */

import anime from 'animejs/lib/anime.es.js';
import { FlowEvent, FlowParticle, Node } from '../types/graph';

export class FlowAnimationEngine {
  private flowEvents: Map<string, FlowEvent> = new Map();
  private particles: Map<string, FlowParticle[]> = new Map();
  private nodes: Map<string, Node> = new Map();
  private animations: Map<string, anime.AnimeInstance> = new Map();
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
   * 添加流动事件 - 使用 Anime.js
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
        progress: 0, // 从 0 开始
        size: 4 + Math.random() * 2,
        color: this.getFlowColor(event.amount),
      });
    }
    this.particles.set(event.id, particles);

    // 使用 Anime.js 创建交错动画
    const animation = anime({
      targets: particles,
      progress: 1,
      duration: event.duration,
      delay: anime.stagger(100), // 每个粒子延迟 100ms，形成流动效果
      easing: 'easeInOutQuad', // 平滑的缓动
      update: (anim) => {
        // 更新事件进度
        flowEvent.progress = anim.progress / 100; // Anime.js 返回 0-100
        flowEvent.status = flowEvent.progress > 0 ? 'active' : 'pending';

        // 通知粒子更新
        if (this.listeners.onParticlesUpdate) {
          const allParticles = Array.from(this.particles.values()).flat();
          this.listeners.onParticlesUpdate(allParticles);
        }
      },
      complete: () => {
        this.handleFlowComplete(flowEvent);
      }
    });

    this.animations.set(event.id, animation);
  }

  /**
   * 移除流动事件
   */
  removeFlowEvent(eventId: string): void {
    const animation = this.animations.get(eventId);
    if (animation) {
      // Anime.js 不需要手动停止，会自动完成
      this.animations.delete(eventId);
    }
    this.flowEvents.delete(eventId);
    this.particles.delete(eventId);
  }

  /**
   * 更新节点数据量 - 使用 Anime.js
   */
  updateNodeData(nodeId: string, newAmount: number, duration: number = 500): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Anime.js 自动处理数值插值和缓动
    anime({
      targets: node,
      dataAmount: newAmount,
      duration: duration,
      easing: 'easeInOutCubic',
      round: 1, // 四舍五入到整数
      update: () => {
        if (this.listeners.onNodeUpdate) {
          this.listeners.onNodeUpdate({ ...node });
        }
      }
    });
  }

  /**
   * 启动动画（Anime.js 自动管理，此方法保持接口一致）
   */
  start(): void {
    // Anime.js 会自动开始动画，无需手动启动
    // 保留此方法是为了与原有 API 保持一致
  }

  /**
   * 暂停所有动画
   */
  pause(): void {
    this.animations.forEach(anim => {
      if (anim && !anim.paused) {
        anim.pause();
      }
    });
  }

  /**
   * 恢复所有动画
   */
  resume(): void {
    this.animations.forEach(anim => {
      if (anim && anim.paused) {
        anim.play();
      }
    });
  }

  /**
   * 处理流动完成
   */
  private handleFlowComplete(event: FlowEvent): void {
    event.status = 'completed';

    if (this.listeners.onFlowComplete) {
      this.listeners.onFlowComplete(event);
    }

    // 清理
    this.particles.delete(event.id);
    this.animations.delete(event.id);
    this.flowEvents.delete(event.id);
  }

  /**
   * 获取流动颜色
   */
  private getFlowColor(amount: number): string {
    if (amount > 100) return '#ff4444';
    if (amount > 50) return '#ff9944';
    return '#44aaff';
  }

  /**
   * 缓动函数：三次方缓入缓出（保留兼容性，Anime.js 已内置）
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
    // 停止所有动画
    this.animations.forEach(anim => {
      if (anim) {
        anim.pause();
      }
    });
    this.animations.clear();
    this.flowEvents.clear();
    this.particles.clear();
    this.nodes.clear();
    this.listeners = {};
  }
}
