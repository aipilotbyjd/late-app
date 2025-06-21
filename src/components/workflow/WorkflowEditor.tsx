'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Play, Save, Map, Zap } from 'lucide-react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodePropertiesPanel from './NodePropertiesPanel';

import { Connection, Edge, Node } from 'reactflow';
import WorkflowNode from './WorkflowNode'; // Custom node
import { WorkflowNode as WorkflowNodeType } from '@/types/workflow';

const WorkflowEditor = () => {
  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeType['data']>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const nodeTypes = {
    trigger: WorkflowNode,
    webhook: WorkflowNode,
    schedule: WorkflowNode,
    http: WorkflowNode,
    email: WorkflowNode,
    database: WorkflowNode,
    code: WorkflowNode,
    filter: WorkflowNode,
    merge: WorkflowNode,
  };
  const { toast } = useToast();

  const selectedNode = nodes.find(n => n.selected) as Node<WorkflowNodeType['data']> | null;

  const onUpdateNode = useCallback(
    (nodeId: string, data: Partial<WorkflowNodeType['data']>) => {
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
    const newNode: Node<WorkflowNodeType['data']> = {
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

    toast({
      title: "Node Added",
      description: `${nodeType} node has been added to the workflow`,
    });
  }, [setNodes, toast]);

  const executeWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      toast({
        title: "No Workflow",
        description: "Please add some nodes to execute the workflow",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);

    try {
      for (const node of nodes) {
        setNodes((nds) =>
          nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n))
        );
        await new Promise(resolve => setTimeout(resolve, 500));

        const success = Math.random() > 0.1; // 90% success rate
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    status: success ? 'success' : 'error',
                    executionTime: Math.random() * 1000 + 200,
                  },
                }
              : n
          )
        );

        if (!success) break;
      }

      toast({
        title: "Workflow Executed",
        description: "Your workflow has been executed successfully",
      });
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: "There was an error executing your workflow",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, setNodes, toast]);

  const saveWorkflow = useCallback(() => {
    const workflow = {
      nodes,
      edges,
      metadata: {
        name: "Advanced Workflow",
        created: new Date().toISOString(),
        version: "1.0.0"
      }
    };

    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'advanced-workflow.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Workflow Saved",
      description: "Your advanced workflow has been downloaded",
    });
  }, [nodes, edges, toast]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowWrapper.current
        ? {
            x: event.clientX - reactFlowWrapper.current.getBoundingClientRect().left,
            y: event.clientY - reactFlowWrapper.current.getBoundingClientRect().top,
          }
        : { x: 0, y: 0 };

      addNode(type, position);
    },
    [addNode]
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <ReactFlowProvider>
        <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-800">Advanced n8n Editor</h1>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={executeWorkflow}
                  disabled={isExecuting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isExecuting ? 'Executing...' : 'Execute'}
                </Button>

                <Button onClick={saveWorkflow} variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowMinimap(!showMinimap)}
                variant={showMinimap ? "default" : "outline"}
                size="sm"
              >
                <Map className="w-4 h-4 mr-2" />
                Minimap
              </Button>

              <Button
                onClick={() => setShowGrid(!showGrid)}
                variant={showGrid ? "default" : "outline"}
                size="sm"
              >
                Grid
              </Button>

              <div className="text-sm text-slate-600">
                {nodes.length} nodes | {edges.length} connections
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow flex relative overflow-hidden" ref={reactFlowWrapper}>
          <NodePalette onAddNode={addNode} />

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <Controls />
            {showGrid && <Background color="#aaa" gap={16} />}
            {showMinimap && (
              <MiniMap
                nodeStrokeWidth={3}
                nodeColor={(node) => {
                  switch (node.type) {
                    case 'trigger': return '#4CAF50';
                    case 'webhook': return '#8B9467';
                    case 'schedule': return '#FF9800';
                    case 'http': return '#03A9F4';
                    case 'email': return '#8E24AA';
                    case 'database': return '#4CAF50';
                    case 'code': return '#FFC107';
                    case 'filter': return '#8B9467';
                    case 'merge': return '#03A9F4';
                    default: return '#ccc';
                  }
                }}
                maskColor="#ffffff"
                maskStrokeWidth={1}
              />
            )}
          </ReactFlow>

          <NodePropertiesPanel selectedNode={selectedNode} onUpdateNode={onUpdateNode} />
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default WorkflowEditor;
