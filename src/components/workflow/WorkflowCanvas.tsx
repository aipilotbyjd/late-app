
import React, { forwardRef, useCallback, useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import WorkflowNode from './WorkflowNode';
import ConnectionLine from './ConnectionLine';
import { WorkflowNode as WorkflowNodeType, Connection } from '@/types/workflow';

interface WorkflowCanvasProps {
  nodes: WorkflowNodeType[];
  connections: Connection[];
  selectedNode: WorkflowNodeType | null;
  showGrid: boolean;
  onNodeSelect: (node: WorkflowNodeType | null) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<WorkflowNodeType>) => void;
  onNodeDelete: (nodeId: string) => void;
  onConnectionCreate: (sourceId: string, targetId: string) => void;
  onAddNode: (nodeType: string, position: { x: number; y: number }) => void;
}

const WorkflowCanvas = forwardRef<HTMLDivElement, WorkflowCanvasProps>(({
  nodes,
  connections,
  selectedNode,
  showGrid,
  onNodeSelect,
  onNodeUpdate,
  onNodeDelete,
  onConnectionCreate,
  onAddNode
}, ref) => {
  const [draggedNode, setDraggedNode] = useState<WorkflowNodeType | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<{ nodeId: string; isOutput: boolean } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('application/reactflow');
    
    if (nodeType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      onAddNode(nodeType, position);
    }
  }, [onAddNode]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, node: WorkflowNodeType) => {
    if (e.button !== 0) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggedNode(node);
    onNodeSelect(node);
  }, [onNodeSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode || !canvasRef.current) return;
    
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const newPosition = {
      x: e.clientX - rect.left - dragOffset.x,
      y: e.clientY - rect.top - dragOffset.y
    };
    
    onNodeUpdate(draggedNode.id, { position: newPosition });
  }, [draggedNode, dragOffset, onNodeUpdate]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onNodeSelect(null);
      setConnecting(null);
    }
  }, [onNodeSelect]);

  const handleConnectionStart = useCallback((nodeId: string, isOutput: boolean) => {
    setConnecting({ nodeId, isOutput });
  }, []);

  const handleConnectionEnd = useCallback((nodeId: string, isInput: boolean) => {
    if (connecting && connecting.isOutput && isInput && connecting.nodeId !== nodeId) {
      onConnectionCreate(connecting.nodeId, nodeId);
    }
    setConnecting(null);
  }, [connecting, onConnectionCreate]);

  return (
    <div
      ref={canvasRef}
      className={`flex-1 relative overflow-hidden ${showGrid ? 'bg-grid' : 'bg-slate-50'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
      style={{
        backgroundImage: showGrid 
          ? `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`
          : 'none',
        backgroundSize: showGrid ? '20px 20px' : 'auto'
      }}
    >
      {/* Connections */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {connections.map(connection => {
          const sourceNode = nodes.find(n => n.id === connection.sourceId);
          const targetNode = nodes.find(n => n.id === connection.targetId);
          
          if (!sourceNode || !targetNode) return null;
          
          return (
            <ConnectionLine
              key={connection.id}
              sourcePosition={{
                x: sourceNode.position.x + 200,
                y: sourceNode.position.y + 40
              }}
              targetPosition={{
                x: targetNode.position.x,
                y: targetNode.position.y + 40
              }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map(node => (
        <WorkflowNode
          key={node.id}
          node={node}
          isSelected={selectedNode?.id === node.id}
          onMouseDown={(e) => handleMouseDown(e, node)}
          onDelete={() => onNodeDelete(node.id)}
          onConnectionStart={handleConnectionStart}
          onConnectionEnd={handleConnectionEnd}
          connecting={connecting}
        />
      ))}

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-2">Start Building Your Workflow</h3>
            <p className="text-slate-500 max-w-md">
              Drag nodes from the palette on the left to start creating your workflow, 
              or click on any node type to add it to the canvas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

WorkflowCanvas.displayName = 'WorkflowCanvas';

export default WorkflowCanvas;
