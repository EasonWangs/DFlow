# 动画问题修复方案

## 🐛 需要修复的问题

### 1. 修复动画引擎启动逻辑
**文件：** `src/hooks/useFlowGraph.ts:78-85`

**当前代码：**
```typescript
const addFlowEvent = (event: FlowEvent) => {
  if (animationEngine) {
    animationEngine.addFlowEvent(event);

    if (!animationEngine) return;  // ❌ 错误：重复检查
    animationEngine.start();
  }
};
```

**修复后：**
```typescript
const addFlowEvent = (event: FlowEvent) => {
  if (animationEngine) {
    animationEngine.addFlowEvent(event);
    animationEngine.start();
  }
};
```

---

### 2. 修复粒子更新监听
**文件：** `src/components/FlowGraph/FlowGraph.vue:232-238`

**当前代码：**
```typescript
watch(animationEngine, (engine) => {  // ❌ animationEngine 是函数
  if (!engine) return;
  engine.on('particlesUpdate', (newParticles: FlowParticle[]) => {
    particles.value = newParticles;
  });
});
```

**修复后：**
```typescript
onMounted(() => {
  const engine = animationEngine();
  if (engine) {
    engine.on('particlesUpdate', (newParticles: FlowParticle[]) => {
      particles.value = newParticles;
    });
  }
});
```

---

### 3. 优化节点初始位置
**文件：** `src/engine/LayoutEngine.ts`

在力导向布局中添加初始位置：

```typescript
createForceLayout(
  nodes: SimulationNode[],
  edges: SimulationEdge[],
  options?: {...}
): d3.Simulation<SimulationNode, SimulationEdge> {
  // 为没有位置的节点设置初始位置
  nodes.forEach((node, i) => {
    if (node.x === undefined || node.y === undefined) {
      const angle = (i / nodes.length) * Math.PI * 2;
      const radius = Math.min(this.width, this.height) / 4;
      node.x = this.width / 2 + radius * Math.cos(angle);
      node.y = this.height / 2 + radius * Math.sin(angle);
    }
  });

  // ... 原有代码
}
```

---

### 4. 改进动画循环性能
**文件：** `src/engine/FlowAnimationEngine.ts:126-142`

使用性能监控和自适应帧率：

```typescript
private tick(timestamp: number): void {
  if (!this.isRunning) return;

  const deltaTime = timestamp - this.lastTimestamp;
  this.lastTimestamp = timestamp;

  // 限制最大 deltaTime，避免标签页切换后的跳跃
  const clampedDelta = Math.min(deltaTime, 100);

  this.updateFlowEvents(clampedDelta);
  this.updateParticles(clampedDelta);

  if (this.listeners.onParticlesUpdate) {
    const allParticles = Array.from(this.particles.values()).flat();
    this.listeners.onParticlesUpdate(allParticles);
  }

  this.animationFrameId = requestAnimationFrame((ts) => this.tick(ts));
}
```

---

## 🚀 性能优化建议

### 减少不必要的重新渲染
在 FlowGraph.vue 中使用 `v-memo` 优化：

```vue
<g
  v-for="node in simulationNodes"
  :key="node.id"
  v-memo="[node.x, node.y, node.dataAmount]"
  class="node-group"
>
  <!-- 节点渲染 -->
</g>
```

### 使用 CSS transform 代替 cx/cy
对于粒子动画，使用 CSS transform 性能更好：

```vue
<circle
  v-for="particle in particles"
  :key="particle.id"
  :r="particle.size"
  :fill="particle.color"
  :style="{
    transform: `translate(${getParticlePosition(particle).x}px, ${getParticlePosition(particle).y}px)`
  }"
  class="particle"
/>
```

### 节流粒子更新
如果粒子数量很多，使用节流：

```typescript
import { throttle } from 'lodash-es'; // 或自己实现

const throttledUpdate = throttle((newParticles) => {
  particles.value = newParticles;
}, 16); // 约 60 FPS
```
