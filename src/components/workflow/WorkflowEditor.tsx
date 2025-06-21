'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Save, Map, Grid, Zap, Search, Settings, HelpCircle, Bell, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import NodePalette from './NodePalette';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowInstance,
  Connection,
  Edge,
  Node,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodePropertiesPanel from './NodePropertiesPanel';
import WorkflowNode from './WorkflowNode';
import { WorkflowNodeData } from '@/types/workflow';

const WorkflowEditor = () => {
  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { toast } = useToast();

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const deleteNode = useCallback((id: string) => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  }, [setNodes]);

  const nodeTypes = useMemo(() => ({
    trigger: (props: any) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    webhook: (props: any) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    schedule: (props: any) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    http: (props: any) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    email: (props: any) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    database: (props: any) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    code: (props: any) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    filter: (props: any) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    merge: (props: any) => <WorkflowNode {...props} deleteNode={deleteNode} />,
  }), [deleteNode]);

  const selectedNode = useMemo(() => nodes.find(n => n.selected), [nodes]);

  const onUpdateNode = useCallback(
    (nodeId: string, data: Partial<WorkflowNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...data } };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const addNode = useCallback((nodeType: string, position: { x: number; y: number }) => {
    const newNode: Node<WorkflowNodeData> = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType,
      position,
      data: {
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        type: nodeType,
        status: 'idle',
        parameters: {},
      }
    };
    setNodes((nds) => nds.concat(newNode));
    toast({ title: "Node Added", description: `${nodeType} node has been added.` });
  }, [setNodes, toast]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type || !reactFlowInstance) return;
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;
      const position = reactFlowInstance.project({ x: event.clientX - reactFlowBounds.left, y: event.clientY - reactFlowBounds.top });
      addNode(type, position);
    },
    [addNode, reactFlowInstance]
  );

  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true);
    try {
      // Simulate workflow execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update node statuses
      setNodes((nds) =>
        nds.map((node, index) => {
          // Simulate sequential execution with delays
          const delay = index * 500;
          setTimeout(() => {
            setNodes(innerNds =>
              innerNds.map(innerNode => {
                if (innerNode.id === node.id) {
                  return {
                    ...innerNode,
                    data: {
                      ...innerNode.data,
                      status: 'running'
                    }
                  };
                }
                return innerNode;
              })
            );

            setTimeout(() => {
              setNodes(innerNds =>
                innerNds.map(innerNode => {
                  if (innerNode.id === node.id) {
                    return {
                      ...innerNode,
                      data: {
                        ...innerNode.data,
                        status: 'success',
                        executionTime: Math.floor(Math.random() * 1000) + 500
                      }
                    };
                  }
                  return innerNode;
                })
              );
            }, 1000);
          }, delay);

          return node;
        })
      );

      toast({ title: "Workflow Executed", description: "The workflow has been successfully executed." });
    } catch (error) {
      toast({ title: "Execution Failed", description: "There was an error executing the workflow." });

      // Mark a random node as failed for demonstration
      const randomNodeIndex = Math.floor(Math.random() * nodes.length);
      setNodes((nds) =>
        nds.map((node, index) => {
          if (index === randomNodeIndex) {
            return {
              ...node,
              data: {
                ...node.data,
                status: 'error',
                executionTime: Math.floor(Math.random() * 500) + 100
              }
            };
          }
          return node;
        })
      );
    } finally {
      setTimeout(() => {
        setIsExecuting(false);
      }, 2000 + nodes.length * 500);
    }
  }, [nodes, setNodes, toast]);

  const saveWorkflow = useCallback(() => {
    try {
      // Simulate saving workflow data to local storage or a backend
      const workflowData = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type
        }))
      };

      // Store in localStorage for demonstration
      localStorage.setItem('workflowData', JSON.stringify(workflowData));

      toast({ title: "Workflow Saved", description: "The workflow has been successfully saved." });
    } catch (error) {
      toast({ title: "Save Failed", description: "There was an error saving the workflow." });
      console.error("Error saving workflow:", error);
    }
  }, [nodes, edges, toast]);

  const defaultEdgeOptions = useMemo(() => ({
    animated: true,
    type: 'smoothstep',
    style: { strokeWidth: 2, stroke: '#9CA3AF' },
    markerEnd: { type: MarkerType.ArrowClosed },
  }), []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex-1 flex overflow-hidden">
        <ReactFlowProvider>
          <motion.div
            className="w-72 bg-white border-r border-gray-200 flex flex-col h-full"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }}
          >
            <div className="flex-1 overflow-y-auto">
              <NodePalette onAddNode={addNode} />
            </div>
          </motion.div>

          <div className="flex-1 relative" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              fitView
              className="bg-gradient-to-b from-gray-50 to-gray-200"
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              minZoom={0.2}
              maxZoom={2}
            >
              <Controls position="bottom-right" />
              {showGrid && <Background color="#E5E7EB" gap={24} />}
              {showMinimap && (
                <MiniMap
                  nodeStrokeWidth={2}
                  nodeColor={(node) => {
                    const colors: { [key: string]: string } = {
                      trigger: '#FF6B6B', webhook: '#4D96FF', schedule: '#6C63FF',
                      http: '#4D96FF', email: '#FF9F43', database: '#28C76F',
                      code: '#EA5455', filter: '#00CFE8', merge: '#9C27B0',
                    };
                    return colors[node.data.type || ''] || '#9CA3AF';
                  }}
                  nodeBorderRadius={4}
                  maskColor="rgba(255, 255, 255, 0.6)"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '0.375rem', border: '1px solid #E5E7EB' }}
                />
              )}
            </ReactFlow>
            <motion.div
              className="absolute top-3 left-3 z-10 flex space-x-2"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs font-medium bg-white/80 backdrop-blur-sm" onClick={() => setShowGrid(!showGrid)}>
                  <Grid className="w-3.5 h-3.5 mr-1.5" />
                  {showGrid ? 'Hide Grid' : 'Show Grid'}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs font-medium bg-white/80 backdrop-blur-sm" onClick={() => setShowMinimap(!showMinimap)}>
                  <Map className="w-3.5 h-3.5 mr-1.5" />
                  {showMinimap ? 'Hide Minimap' : 'Show Minimap'}
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              className="absolute top-3 right-3 z-10 flex space-x-2"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-100 text-green-800 hover:bg-green-200"
                  onClick={executeWorkflow}
                  disabled={isExecuting}
                >
                  <Play className="w-4 h-4 mr-1" />
                  {isExecuting ? 'Executing...' : 'Execute'}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                  onClick={saveWorkflow}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <AnimatePresence>
            {selectedNode && (
              <motion.div
                className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <NodePropertiesPanel selectedNode={selectedNode} onUpdateNode={onUpdateNode} onClose={() => {
                  setNodes(nodes.map(n => ({ ...n, selected: false })));
                }} />
              </motion.div>
            )}
          </AnimatePresence>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default WorkflowEditor;
