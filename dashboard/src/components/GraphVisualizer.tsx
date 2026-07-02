import { useEffect, useState, useCallback, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import { Sparkles, RefreshCw, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getNodeColor = (type: string) => {
  switch (type) {
    case 'Person':
      return '#9333ea'; // Purple
    case 'Document':
      return '#059669'; // Emerald
    case 'Repository':
      return '#ea580c'; // Orange
    case 'Concept':
    default:
      return '#6366f1'; // Indigo
  }
};

export default function GraphVisualizer() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [timeTravelDays, setTimeTravelDays] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        // Don't set dimensions if they are 0, it crashes ForceGraph3D
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const fetchGraph = useCallback(async (daysAgo: number = 0) => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/graph`;
      if (daysAgo > 0) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - daysAgo);
        url += `?date=${targetDate.toISOString()}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Transform edges to links for ForceGraph3D
      const links = data.edges.map((edge: any) => ({
        source: edge.source,
        target: edge.target,
      }));

      // Map nodes with colors and names, and strip absolute x/y coordinates 
      // from the 2D backend so the 3D physics engine centers them at the origin.
      const nodes = data.nodes.map((node: any) => {
        const { x, y, ...restNode } = node; // Destructure to remove x and y
        return {
          ...restNode,
          name: node.data?.label || node.id,
          type: node.data?.type || 'Concept',
          color: getNodeColor(node.data?.type || 'Concept'),
        };
      });

      setGraphData({ nodes, links });
    } catch (err) {
      console.error("Failed to load graph data", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGraph(timeTravelDays);
  }, [timeTravelDays, fetchGraph]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full h-[600px] mt-8 relative glass-card rounded-2xl overflow-hidden border border-white/10 group bg-zinc-950"
    >
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
        <Sparkles size={14} className="text-blue-400" />
        <span className="text-xs font-medium text-white tracking-wide uppercase">Kyro Brain (3D)</span>
      </div>
      
      {/* Time Machine UI */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-zinc-900/90 p-4 rounded-xl border border-white/10 backdrop-blur-md flex flex-col items-center gap-2 w-72 shadow-2xl"
      >
        <div className="flex justify-between w-full text-xs text-zinc-400 font-medium">
          <span>{timeTravelDays === 30 ? '30 Days Ago' : timeTravelDays > 0 ? `${timeTravelDays} Days Ago` : 'Live Now'}</span>
          <span className="text-blue-400">Time Machine</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="30" 
          step="1"
          value={timeTravelDays}
          onChange={(e) => setTimeTravelDays(parseInt(e.target.value))}
          className="w-full accent-blue-500 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
        />
      </motion.div>
      
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => fetchGraph(timeTravelDays)}
        className="absolute top-4 right-4 z-10 p-2 bg-zinc-900/80 hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400 rounded-full border border-white/10 backdrop-blur-md transition-colors shadow-sm"
      >
        <RefreshCw size={14} className={loading ? 'animate-spin text-blue-400' : ''} />
      </motion.button>

      <AnimatePresence>
        {!loading && graphData.nodes.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-sm"
          >
            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
              <Network size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Graph is Empty</h3>
            <p className="text-zinc-400 max-w-md mx-auto text-center text-[15px] leading-relaxed">
              Kyro hasn't captured any context yet. Start browsing with the Chrome extension or inject data via the Webhook API to build your Knowledge Graph.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && graphData.nodes.length > 0 && (
        <div className="absolute inset-0 z-0" ref={containerRef}>
          <ForceGraph3D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            backgroundColor="#09090b" // Zinc-950 to match container
            nodeLabel="name"
            nodeColor="color"
            nodeRelSize={6}
            linkWidth={1.5}
            linkColor={() => 'rgba(129, 140, 248, 0.4)'} // Indigo-400 with opacity
            linkOpacity={0.4}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.005}
          nodeThreeObject={(node: any) => {
            const sprite = new SpriteText(node.name);
            sprite.color = node.color;
            sprite.textHeight = 4;
            sprite.fontWeight = 'bold';
            sprite.backgroundColor = 'rgba(0,0,0,0.6)';
            sprite.padding = 2;
            sprite.borderRadius = 4;
            return sprite;
          }}
          nodeThreeObjectExtend={true} // renders both the sphere and the text
          onNodeClick={(node: any) => {
            // Aim at node from outside it
            const distance = 80;
            const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

            if (fgRef.current) {
              (fgRef.current as any).cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
                node, // lookAt ({ x, y, z })
                3000  // ms transition duration
              );
            }
          }}
        />
        </div>
      )}
    </motion.div>
  );
}
