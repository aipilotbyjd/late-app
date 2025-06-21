
import React from 'react';
import { Card } from '@/components/ui/card';
import { WorkflowNode } from '@/types/workflow';

interface WorkflowMinimapProps {
  nodes: WorkflowNode[];
  viewport: { x: number; y: number; zoom: number };
  onViewportChange: (viewport: { x: number; y: number; zoom: number }) => void;
}

const WorkflowMinimap: React.FC<WorkflowMinimapProps> = ({
  nodes,
  viewport,
  onViewportChange
}) => {
  const minimapWidth = 200;
  const minimapHeight = 150;
  const scale = 0.1;

  const handleMinimapClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const newViewport = {
      ...viewport,
      x: -(clickX / scale - minimapWidth / 2 / scale),
      y: -(clickY / scale - minimapHeight / 2 / scale)
    };

    onViewportChange(newViewport);
  };

  const getBounds = () => {
    if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };

    const positions = nodes.map(n => n.position);
    const minX = Math.min(...positions.map(p => p.x)) - 100;
    const minY = Math.min(...positions.map(p => p.y)) - 100;
    const maxX = Math.max(...positions.map(p => p.x)) + 300;
    const maxY = Math.max(...positions.map(p => p.y)) + 200;

    return { minX, minY, maxX, maxY };
  };

  const bounds = getBounds();
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;

  return (
    <Card className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur-sm border shadow-lg z-20">
      <div
        className="relative bg-slate-100 cursor-pointer"
        style={{ width: minimapWidth, height: minimapHeight }}
        onClick={handleMinimapClick}
      >
        {/* Nodes */}
        {nodes.map(node => {
          const x = ((node.position.x - bounds.minX) / boundsWidth) * minimapWidth;
          const y = ((node.position.y - bounds.minY) / boundsHeight) * minimapHeight;

          return (
            <div
              key={node.id}
              className="absolute w-2 h-2 bg-blue-500 rounded-sm"
              style={{
                left: x - 1,
                top: y - 1,
                backgroundColor: node.selected ? '#ef4444' : '#3b82f6'
              }}
            />
          );
        })}

        {/* Viewport indicator */}
        <div
          className="absolute border-2 border-red-500 bg-red-200/30"
          style={{
            left: Math.max(0, Math.min(minimapWidth - 20, ((-viewport.x - bounds.minX) / boundsWidth) * minimapWidth)),
            top: Math.max(0, Math.min(minimapHeight - 20, ((-viewport.y - bounds.minY) / boundsHeight) * minimapHeight)),
            width: Math.min(minimapWidth, (window.innerWidth / viewport.zoom / boundsWidth) * minimapWidth),
            height: Math.min(minimapHeight, (window.innerHeight / viewport.zoom / boundsHeight) * minimapHeight)
          }}
        />
      </div>

      <div className="text-xs text-slate-500 mt-1 text-center">
        Zoom: {Math.round(viewport.zoom * 100)}%
      </div>
    </Card>
  );
};

export default WorkflowMinimap;
