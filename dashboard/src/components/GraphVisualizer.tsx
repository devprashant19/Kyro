import React, { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Sparkles, RefreshCw } from 'lucide-react';

const customNodeStyle = {
  background: 'rgba(30, 41, 59, 0.6)',
  color: '#f8fafc',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: 500,
  backdropFilter: 'blur(16px)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 20px 0 rgba(99, 102, 241, 0.2)',
};

const customEdgeOptions = {
  style: { stroke: '#818cf8', strokeWidth: 2, filter: 'drop-shadow(0 0 4px rgba(129, 140, 248, 0.8))' },
  animated: true,
};

export default function GraphVisualizer() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/graph');
      const data = await response.json();
      
      // Apply our premium custom styles to nodes
      const styledNodes = data.nodes.map((node: any) => ({
        ...node,
        style: customNodeStyle,
      }));
      
      setNodes(styledNodes);
      setEdges(data.edges);
    } catch (err) {
      console.error("Failed to load graph data", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  return (
    <div className="w-full h-[600px] mt-8 relative glass-card rounded-2xl overflow-hidden border border-white/10 group">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
        <Sparkles size={14} className="text-blue-400" />
        <span className="text-xs font-medium text-white tracking-wide uppercase">Kyro Brain</span>
      </div>
      
      <button 
        onClick={fetchGraph}
        className="absolute top-4 right-4 z-10 p-2 bg-zinc-900/80 hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400 rounded-full border border-white/10 backdrop-blur-md transition-all shadow-sm"
      >
        <RefreshCw size={14} className={loading ? 'animate-spin text-blue-400' : ''} />
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        defaultEdgeOptions={customEdgeOptions}
        fitView
        className="bg-transparent"
      >
        <Controls 
          className="bg-zinc-900/80 border-white/10 rounded-lg overflow-hidden backdrop-blur-md !fill-white" 
          showInteractive={false} 
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1} 
          color="rgba(148, 163, 184, 0.15)" 
        />
      </ReactFlow>
    </div>
  );
}
