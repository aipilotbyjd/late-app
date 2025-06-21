'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Save, Undo, Redo, Map, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import NodePalette from './NodePalette';
import AdvancedWorkflowCanvas from './AdvancedWorkflowCanvas';
import NodePropertiesPanel from './NodePropertiesPanel';
import ToolbarHeader from './ToolbarHeader';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { WorkflowNode, WorkflowState, Connection } from '@/types/workflow';

const WorkflowEditor = () => {
  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const initialState: WorkflowState = {
    nodes: [],
    connections: [],
    groups: [],
    selectedNodes: [],
    viewport: { x: 0, y: 0, zoom: 1 }
  };

  const {
    state,
    undo,
    redo,
    canUndo,
    canRedo,
    addNode: addNodeToState,
    updateNode,
    deleteNodes,
    addConnection,
    selectNodes,
    createGroup,
    updateState
  } = useWorkflowState(initialState);

  const selectedNode = state.nodes.find(n => state.selectedNodes.includes(n.id)) || null;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 's':
            e.preventDefault();
            saveWorkflow();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const addNode = useCallback((nodeType: string, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType,
      position,
      data: {
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        parameters: {},
        status: 'idle'
      }
    };

    addNodeToState(newNode);
    selectNodes([newNode.id]);

    toast({
      title: "Node Added",
      description: `${nodeType} node has been added to the workflow`,
    });
  }, [addNodeToState, selectNodes, toast]);

  const handleConnectionCreate = useCallback((sourceId: string, targetId: string) => {
    const newConnection: Connection = {
      id: `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceId,
      targetId,
      animated: false,
      status: 'idle'
    };

    addConnection(newConnection);

    toast({
      title: "Connection Created",
      description: "Nodes have been connected successfully",
    });
  }, [addConnection, toast]);

  const executeWorkflow = useCallback(async () => {
    if (state.nodes.length === 0) {
      toast({
        title: "No Workflow",
        description: "Please add some nodes to execute the workflow",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);

    try {
      // Simulate workflow execution with status updates
      for (const node of state.nodes) {
        updateNode(node.id, { data: { ...node.data, status: 'running' } });
        await new Promise(resolve => setTimeout(resolve, 500));

        const success = Math.random() > 0.1; // 90% success rate
        updateNode(node.id, {
          data: {
            ...node.data,
            status: success ? 'success' : 'error',
            executionTime: Math.random() * 1000 + 200
          }
        });

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
  }, [state.nodes, updateNode, toast]);

  const saveWorkflow = useCallback(() => {
    const workflow = {
      ...state,
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
  }, [state, toast]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
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

              <Button onClick={undo} disabled={!canUndo} variant="outline" size="sm">
                <Undo className="w-4 h-4" />
              </Button>

              <Button onClick={redo} disabled={!canRedo} variant="outline" size="sm">
                <Redo className="w-4 h-4" />
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
              {state.nodes.length} nodes | {state.connections.length} connections
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <NodePalette onAddNode={addNode} />

        <AdvancedWorkflowCanvas
          nodes={state.nodes}
          connections={state.connections}
          groups={state.groups}
          selectedNodes={state.selectedNodes}
          viewport={state.viewport}
          showGrid={showGrid}
          showMinimap={showMinimap}
          onNodeSelect={selectNodes}
          onNodeUpdate={updateNode}
          onNodeDelete={deleteNodes}
          onConnectionCreate={handleConnectionCreate}
          onConnectionDelete={(connectionId) => {
            updateState({
              connections: state.connections.filter(c => c.id !== connectionId)
            });
          }}
          onAddNode={addNode}
          onGroupCreate={createGroup}
          onViewportChange={(viewport) => updateState({ viewport })}
        />

        <NodePropertiesPanel
          selectedNode={selectedNode}
          onUpdateNode={updateNode}
        />
      </div>
    </div>
  );
};

export default WorkflowEditor;
