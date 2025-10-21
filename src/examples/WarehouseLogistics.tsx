/**
 * 仓库物流示例应用
 * 展示仓库之间的库存流转
 */

import React, { useState, useEffect } from 'react';
import { FlowGraph } from '../components/FlowGraph';
import { GraphData, Node, Edge, FlowEvent } from '../types/graph';
import { generateId } from '../utils/graphUtils';

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

export const WarehouseLogistics: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(createInitialWarehouses());
  const [edges] = useState<Edge[]>(createLogisticsRoutes());
  const [flowEvents, setFlowEvents] = useState<FlowEvent[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // 自动生成物流流动
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      // 随机选择一条路线
      const randomEdge = edges[Math.floor(Math.random() * edges.length)];
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

      setFlowEvents((prev) => [...prev, flowEvent]);

      // 2秒后更新节点数据
      setTimeout(() => {
        setNodes((prevNodes) => {
          return prevNodes.map((node) => {
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
        });

        // 移除已完成的流动事件
        setFlowEvents((prev) => prev.filter((e) => e.id !== flowEvent.id));
      }, 2000);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlay, edges]);

  const graphData: GraphData = {
    nodes,
    edges,
    flowEvents,
  };

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  const handleTransfer = () => {
    if (!selectedNode) return;

    // 从中心仓库向选中的仓库发货
    const edge = edges.find(
      (e) => e.source === 'warehouse-1' && e.target === selectedNode.id
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

    setFlowEvents([...flowEvents, flowEvent]);

    // 2秒后更新数据
    setTimeout(() => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === 'warehouse-1') {
            return { ...node, dataAmount: node.dataAmount - amount };
          }
          if (node.id === selectedNode.id) {
            return {
              ...node,
              dataAmount: Math.min(node.maxCapacity, node.dataAmount + amount),
            };
          }
          return node;
        })
      );

      setFlowEvents((prev) => prev.filter((e) => e.id !== flowEvent.id));
    }, 2000);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>
        仓库物流可视化系统
      </h1>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* 控制面板 */}
        <div
          style={{
            flex: '0 0 300px',
            padding: '20px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3>控制面板</h3>

          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              style={{
                width: '100%',
                padding: '10px',
                background: isAutoPlay ? '#f44336' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {isAutoPlay ? '停止自动流转' : '开始自动流转'}
            </button>
          </div>

          {selectedNode && (
            <div
              style={{
                padding: '15px',
                background: '#f5f5f5',
                borderRadius: '4px',
                marginBottom: '15px',
              }}
            >
              <h4 style={{ marginTop: 0 }}>选中仓库</h4>
              <p>
                <strong>名称：</strong>
                {selectedNode.name}
              </p>
              <p>
                <strong>库存：</strong>
                {Math.round(selectedNode.dataAmount)} /{' '}
                {selectedNode.maxCapacity}
              </p>
              <p>
                <strong>利用率：</strong>
                {((selectedNode.dataAmount / selectedNode.maxCapacity) * 100).toFixed(
                  1
                )}
                %
              </p>

              <button
                onClick={handleTransfer}
                disabled={selectedNode.id === 'warehouse-1'}
                style={{
                  width: '100%',
                  padding: '8px',
                  background:
                    selectedNode.id === 'warehouse-1' ? '#ccc' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor:
                    selectedNode.id === 'warehouse-1' ? 'not-allowed' : 'pointer',
                }}
              >
                从中心仓库调货 (50件)
              </button>
            </div>
          )}

          <div>
            <h4>仓库统计</h4>
            {nodes.map((node) => (
              <div
                key={node.id}
                style={{
                  padding: '8px',
                  marginBottom: '8px',
                  background: '#f9f9f9',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{node.name}</div>
                <div>
                  库存: {Math.round(node.dataAmount)} / {node.maxCapacity}
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    background: '#e0e0e0',
                    borderRadius: '2px',
                    marginTop: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${(node.dataAmount / node.maxCapacity) * 100}%`,
                      height: '100%',
                      background:
                        node.dataAmount / node.maxCapacity > 0.8
                          ? '#f44336'
                          : node.dataAmount / node.maxCapacity > 0.5
                          ? '#ff9800'
                          : '#4CAF50',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 图形展示 */}
        <div style={{ flex: 1 }}>
          <FlowGraph
            data={graphData}
            config={{
              width: 900,
              height: 600,
              enableZoom: true,
              enableDrag: true,
              enableForceSimulation: true,
              particlesPerFlow: 5,
            }}
            onNodeClick={handleNodeClick}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          background: '#e3f2fd',
          borderRadius: '8px',
        }}
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
  );
};
