<template>
  <div class="App">
    <!-- 示例选择器 -->
    <div
      style="
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      "
    >
      <label
        for="example-selector"
        style="
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #333;
          font-size: 14px;
        "
      >
        选择示例：
      </label>
      <select
        id="example-selector"
        v-model="currentExample"
        style="
          width: 200px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
        "
      >
        <option value="warehouse">仓库物流系统</option>
        <option value="comparison">动画引擎对比 (POC)</option>
      </select>
    </div>

    <!-- 动态加载示例 -->
    <component :is="currentComponent" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import WarehouseLogistics from './examples/WarehouseLogistics.vue';
import AnimationComparison from './examples/AnimationComparison.vue';

const currentExample = ref<'warehouse' | 'comparison'>('warehouse');

const currentComponent = computed(() => {
  return currentExample.value === 'warehouse' ? WarehouseLogistics : AnimationComparison;
});
</script>

<style>
@import './App.css';
</style>
