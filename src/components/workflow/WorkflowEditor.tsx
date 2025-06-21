'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Play, Save, Map, Grid, Zap, Plus, Search, Menu, Settings, HelpCircle, Bell, User, ChevronDown, ChevronRight, PanelLeft, PanelRight, PanelTop } from 'lucide-react'; // Add missing imports
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const deleteNode = useCallback((id: string) => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  }, [setNodes]);

  const nodeTypes = useMemo(() => ({
    trigger: (props) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    webhook: (props) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    schedule: (props) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    http: (props) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    email: (props) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    database: (props) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    code: (props) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    filter: (props) => <WorkflowNode {...props} deleteNode={deleteNode} />,
    merge: (props) => <WorkflowNode {...props} deleteNode={deleteNode} />,
  }), [deleteNode]);
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
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid and reactFlowInstance is available
      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      // Get drop position relative to the canvas
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      addNode(type, position);
    },
    [addNode, reactFlowInstance]
  );

  const defaultEdgeOptions = useMemo(() => ({
    animated: true,
    type: 'smoothstep',
    style: { 
      strokeWidth: 2, 
      stroke: '#9CA3AF',
    },
    markerEnd: { 
      type: 'arrowclosed', 
      color: '#9CA3AF',
      width: 14,
      height: 14,
      strokeWidth: 1.5,
    },
  }), []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 h-12 flex items-center px-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-800 rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-base font-semibold text-gray-900">n8n</h1>
          </div>
          <div className="flex items-center space-x-1 text-sm font-medium text-gray-600">
            <span>Workflows</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-1 text-sm font-medium text-gray-600">
            <span>Executions</span>
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workflows..."
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
          
          <Button
            onClick={executeWorkflow}
            disabled={isExecuting}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 h-8"
          >
            <Play className="w-4 h-4 mr-2" />
            {isExecuting ? 'Executing...' : 'Execute'}
          </Button>
          
          <Button
            onClick={saveWorkflow}
            variant="outline"
            className="text-sm font-medium px-3 h-8 border-gray-300"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-600 hover:bg-gray-100">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-600 hover:bg-gray-100">
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-600 hover:bg-gray-100 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <Button variant="ghost" className="h-8 px-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mr-2">
                U
              </div>
              User
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <ReactFlowProvider>
          {/* Left Sidebar - Node Palette */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search nodes..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <NodePalette onAddNode={addNode} />
            </div>
          </div>

          {/* Main Canvas */}
          <div className="flex-1 relative" ref={reactFlowWrapper}>
            <div className="absolute top-3 left-3 z-10 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs font-medium bg-white/80 backdrop-blur-sm"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid className="w-3.5 h-3.5 mr-1.5" />
                {showGrid ? 'Hide Grid' : 'Show Grid'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs font-medium bg-white/80 backdrop-blur-sm"
                onClick={() => setShowMinimap(!showMinimap)}
              >
                <Map className="w-3.5 h-3.5 mr-1.5" />
                {showMinimap ? 'Hide Minimap' : 'Show Minimap'}
              </Button>
            </div>

            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              fitView
              className="bg-gray-50"
              onLoad={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              minZoom={0.2}
              maxZoom={2}
              defaultViewport={{ x: 50, y: 50, zoom: 1 }}
            >
              <Controls 
                position="bottom-right"
                className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden"
                style={{ right: '1rem', bottom: '1rem' }}
              />
              {showGrid && <Background color="#E5E7EB" gap={24} />}
              {showMinimap && (
                <MiniMap
                  nodeStrokeWidth={2}
                  nodeColor={(node) => {
                    const colors = {
                      trigger: '#FF6B6B',
                      webhook: '#4D96FF',
                      schedule: '#6C63FF',
                      http: '#4D96FF',
                      email: '#FF9F43',
                      database: '#28C76F',
                      code: '#EA5455',
                      filter: '#00CFE8',
                      merge: '#9C27B0',
                    };
                    return colors[node.type as keyof typeof colors] || '#9CA3AF';
                  }}
                  nodeBorderRadius={4}
                  maskColor="rgba(255, 255, 255, 0.6)"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '0.375rem',
                    border: '1px solid #E5E7EB',
                    right: '1rem',
                    top: '1rem',
                    width: 150,
                    height: 150,
                  }}
                />
              )}
            </ReactFlow>
          </div>

          {/* Right Sidebar - Node Properties */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
            <NodePropertiesPanel selectedNode={selectedNode} onUpdateNode={onUpdateNode} />
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default WorkflowEditor;
