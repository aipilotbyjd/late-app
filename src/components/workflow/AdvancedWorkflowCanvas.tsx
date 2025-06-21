'use client';

import React, { forwardRef, useCallback, useState, useRef, useEffect } from 'react';
import { Plus, MousePointer, Move, Square, Trash2, Copy, AlignLeft, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import WorkflowNode from './WorkflowNode';
import ConnectionLine from './ConnectionLine';
import WorkflowMinimap from './WorkflowMinimap';
import { WorkflowNode as WorkflowNodeType, Connection, WorkflowGroup } from '@/types/workflow';

interface AdvancedWorkflowCanvasProps {
  nodes: WorkflowNodeType[];
  connections: Connection[];
  groups: WorkflowGroup[];
  selectedNodes: string[];
  viewport: { x: number; y: number; zoom: number };
  showGrid: boolean;
  showMinimap: boolean;
  onNodeSelect: (nodeIds: string[], multiSelect?: boolean) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<WorkflowNodeType>) => void;
  onNodeDelete: (nodeIds: string[]) => void;
  onConnectionCreate: (sourceId: string, targetId: string) => void;
  onConnectionDelete: (connectionId: string) => void;
  onAddNode: (nodeType: string, position: { x: number; y: number }) => void;
  onGroupCreate: (nodeIds: string[]) => void;
  onViewportChange: (viewport: { x: number; y: number; zoom: number }) => void;
}

const AdvancedWorkflowCanvas = forwardRef<HTMLDivElement, AdvancedWorkflowCanvasProps>(({
  nodes,
  connections,
  groups,
  selectedNodes,
  viewport,
  showGrid,
  showMinimap,
  onNodeSelect,
  onNodeUpdate,
  onNodeDelete,
  onConnectionCreate,
  onConnectionDelete,
  onAddNode,
  onGroupCreate,
  onViewportChange
}, ref) => {
  const [draggedNode, setDraggedNode] = useState<WorkflowNodeType | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<{ nodeId: string; isOutput: boolean } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  const [canvasMode, setCanvasMode] = useState<'select' | 'pan' | 'connect'>('select');
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault();
            onNodeSelect(nodes.map(n => n.id));
            break;
          case 'c':
            e.preventDefault();
            if (selectedNodes.length > 0) {
              console.log('Copy nodes:', selectedNodes);
            }
            break;
          case 'g':
            e.preventDefault();
            if (selectedNodes.length > 1) {
              onGroupCreate(selectedNodes);
            }
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            if (selectedNodes.length > 0) {
              onNodeDelete(selectedNodes);
            }
            break;
          case 'Escape':
            onNodeSelect([]);
            setSelectionBox(null);
            setConnecting(null);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, nodes, onNodeSelect, onNodeDelete, onGroupCreate]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set drag over to false if we're leaving the canvas container
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    console.log('Drop event triggered');
    
    const nodeType = e.dataTransfer.getData('application/reactflow');
    console.log('Retrieved node type from drag data:', nodeType);
    
    if (nodeType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      console.log('Canvas bounds:', rect);
      console.log('Drop coordinates (client):', { x: e.clientX, y: e.clientY });
      console.log('Current viewport:', viewport);
      
      // Calculate position relative to canvas in screen coordinates
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      
      // Transform to world coordinates accounting for zoom and pan
      const worldX = (canvasX - viewport.x) / viewport.zoom;
      const worldY = (canvasY - viewport.y) / viewport.zoom;
      
      const position = {
        x: worldX,
        y: worldY
      };
      
      console.log('Final calculated position:', position);
      onAddNode(nodeType, position);
    } else {
      console.log('No node type found or canvas ref missing');
    }
  }, [onAddNode, viewport]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (canvasMode === 'pan' || e.ctrlKey) {
      setIsPanning(true);
      setPanStart({ x: clientX - viewport.x, y: clientY - viewport.y });
    } else if (canvasMode === 'select') {
      const worldPos = {
        x: (clientX - viewport.x) / viewport.zoom,
        y: (clientY - viewport.y) / viewport.zoom
      };
      setSelectionBox({ start: worldPos, end: worldPos });
    }
  }, [canvasMode, viewport]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (isPanning) {
      const newViewport = {
        ...viewport,
        x: clientX - panStart.x,
        y: clientY - panStart.y
      };
      onViewportChange(newViewport);
    } else if (selectionBox) {
      const worldPos = {
        x: (clientX - viewport.x) / viewport.zoom,
        y: (clientY - viewport.y) / viewport.zoom
      };
      setSelectionBox({ ...selectionBox, end: worldPos });
    }

    if (draggedNode) {
      e.preventDefault();
      const newPosition = {
        x: (clientX - viewport.x) / viewport.zoom - dragOffset.x,
        y: (clientY - viewport.y) / viewport.zoom - dragOffset.y
      };
      
      onNodeUpdate(draggedNode.id, { position: newPosition });
      
      if (selectedNodes.includes(draggedNode.id) && selectedNodes.length > 1) {
        selectedNodes.forEach(nodeId => {
          if (nodeId !== draggedNode.id) {
            const node = nodes.find(n => n.id === nodeId);
            if (node) {
              onNodeUpdate(nodeId, {
                position: {
                  x: node.position.x + (newPosition.x - draggedNode.position.x),
                  y: node.position.y + (newPosition.y - draggedNode.position.y)
                }
              });
            }
          }
        });
      }
    }
  }, [isPanning, panStart, viewport, onViewportChange, selectionBox, draggedNode, dragOffset, selectedNodes, nodes, onNodeUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggedNode(null);
    
    if (selectionBox) {
      const minX = Math.min(selectionBox.start.x, selectionBox.end.x);
      const maxX = Math.max(selectionBox.start.x, selectionBox.end.x);
      const minY = Math.min(selectionBox.start.y, selectionBox.end.y);
      const maxY = Math.max(selectionBox.start.y, selectionBox.end.y);
      
      const selectedNodeIds = nodes
        .filter(node => 
          node.position.x >= minX && 
          node.position.x <= maxX && 
          node.position.y >= minY && 
          node.position.y <= maxY
        )
        .map(node => node.id);
      
      onNodeSelect(selectedNodeIds);
      setSelectionBox(null);
    }
  }, [selectionBox, nodes, onNodeSelect]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, viewport.zoom * zoomFactor));
    
    const newViewport = {
      x: clientX - (clientX - viewport.x) * (newZoom / viewport.zoom),
      y: clientY - (clientY - viewport.y) * (newZoom / viewport.zoom),
      zoom: newZoom
    };
    
    onViewportChange(newViewport);
  }, [viewport, onViewportChange]);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, node: WorkflowNodeType) => {
    e.stopPropagation();
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    setDragOffset({
      x: (e.clientX - canvasRect.left - viewport.x) / viewport.zoom - node.position.x,
      y: (e.clientY - canvasRect.top - viewport.y) / viewport.zoom - node.position.y
    });
    setDraggedNode(node);
    
    if (!selectedNodes.includes(node.id)) {
      onNodeSelect([node.id], e.ctrlKey || e.metaKey);
    }
  }, [viewport, selectedNodes, onNodeSelect]);

  const alignNodes = useCallback((direction: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v') => {
    if (selectedNodes.length < 2) return;

    const selectedNodeObjects = nodes.filter(n => selectedNodes.includes(n.id));
    
    switch (direction) {
      case 'left':
        const minX = Math.min(...selectedNodeObjects.map(n => n.position.x));
        selectedNodeObjects.forEach(node => {
          onNodeUpdate(node.id, { position: { ...node.position, x: minX } });
        });
        break;
      case 'top':
        const minY = Math.min(...selectedNodeObjects.map(n => n.position.y));
        selectedNodeObjects.forEach(node => {
          onNodeUpdate(node.id, { position: { ...node.position, y: minY } });
        });
        break;
    }
  }, [selectedNodes, nodes, onNodeUpdate]);

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex space-x-2">
        <Button
          variant={canvasMode === 'select' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCanvasMode('select')}
        >
          <MousePointer className="w-4 h-4" />
        </Button>
        <Button
          variant={canvasMode === 'pan' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCanvasMode('pan')}
        >
          <Move className="w-4 h-4" />
        </Button>
        {selectedNodes.length > 1 && (
          <>
            <Button variant="outline" size="sm" onClick={() => alignNodes('left')}>
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onGroupCreate(selectedNodes)}>
              <Square className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Selection count */}
      {selectedNodes.length > 0 && (
        <div className="absolute top-4 right-4 z-20 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
          {selectedNodes.length} selected
        </div>
      )}

      <div
        ref={canvasRef}
        className={`flex-1 relative overflow-hidden ${
          canvasMode === 'pan' ? 'cursor-move' : 'cursor-default'
        } ${isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          backgroundImage: showGrid 
            ? `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`
            : 'none',
          backgroundSize: showGrid ? `${20 * viewport.zoom}px ${20 * viewport.zoom}px` : 'auto',
          backgroundPosition: `${viewport.x}px ${viewport.y}px`
        }}
      >
        <div
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%'
          }}
        >
          {/* Groups */}
          {groups.map(group => (
            <div
              key={group.id}
              className="absolute border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-lg"
              style={{
                left: group.position.x,
                top: group.position.y,
                width: group.size.width,
                height: group.size.height,
                zIndex: 0
              }}
            >
              <div className="absolute -top-6 left-2 text-sm font-medium text-slate-600">
                {group.label}
              </div>
            </div>
          ))}

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
              isSelected={selectedNodes.includes(node.id)}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onDelete={() => onNodeDelete([node.id])}
              onConnectionStart={(nodeId, isOutput) => setConnecting({ nodeId, isOutput })}
              onConnectionEnd={(nodeId, isInput) => {
                if (connecting && connecting.isOutput && isInput && connecting.nodeId !== nodeId) {
                  onConnectionCreate(connecting.nodeId, nodeId);
                }
                setConnecting(null);
              }}
              connecting={connecting}
            />
          ))}

          {/* Selection box */}
          {selectionBox && (
            <div
              className="absolute border-2 border-blue-500 bg-blue-100/20 pointer-events-none"
              style={{
                left: Math.min(selectionBox.start.x, selectionBox.end.x),
                top: Math.min(selectionBox.start.y, selectionBox.end.y),
                width: Math.abs(selectionBox.end.x - selectionBox.start.x),
                height: Math.abs(selectionBox.end.y - selectionBox.start.y),
                zIndex: 100
              }}
            />
          )}

          {/* Drop indicator */}
          {isDragOver && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
                Drop here to add node
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">Start Building Your Workflow</h3>
              <p className="text-slate-500 max-w-md">
                Drag nodes from the palette on the left to start creating your workflow.
                Use Ctrl+A to select all, Ctrl+G to group nodes, and mouse wheel to zoom.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Minimap */}
      {showMinimap && (
        <WorkflowMinimap
          nodes={nodes}
          viewport={viewport}
          onViewportChange={onViewportChange}
        />
      )}
    </div>
  );
});

AdvancedWorkflowCanvas.displayName = 'AdvancedWorkflowCanvas';

export default AdvancedWorkflowCanvas;
