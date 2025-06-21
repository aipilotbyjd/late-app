
import { useState, useCallback, useRef } from 'react';
import { WorkflowState, WorkflowAction, WorkflowNode, Connection, WorkflowGroup } from '../types/workflow';

const MAX_HISTORY_SIZE = 50;

export const useWorkflowState = (initialState: WorkflowState) => {
  const [currentState, setCurrentState] = useState<WorkflowState>(initialState);
  const [history, setHistory] = useState<WorkflowState[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoRef = useRef(false);

  const pushToHistory = useCallback((newState: WorkflowState) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY_SIZE - 1));
  }, [historyIndex]);

  const updateState = useCallback((updates: Partial<WorkflowState>) => {
    const newState = { ...currentState, ...updates };
    setCurrentState(newState);
    pushToHistory(newState);
  }, [currentState, pushToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoRef.current = true;
      const prevState = history[historyIndex - 1];
      setCurrentState(prevState);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      const nextState = history[historyIndex + 1];
      setCurrentState(nextState);
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Helper methods for common operations
  const addNode = useCallback((node: WorkflowNode) => {
    updateState({
      nodes: [...currentState.nodes, node]
    });
  }, [currentState.nodes, updateState]);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    updateState({
      nodes: currentState.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    });
  }, [currentState.nodes, updateState]);

  const deleteNodes = useCallback((nodeIds: string[]) => {
    updateState({
      nodes: currentState.nodes.filter(node => !nodeIds.includes(node.id)),
      connections: currentState.connections.filter(conn =>
        !nodeIds.includes(conn.sourceId) && !nodeIds.includes(conn.targetId)
      ),
      selectedNodes: currentState.selectedNodes.filter(id => !nodeIds.includes(id))
    });
  }, [currentState, updateState]);

  const addConnection = useCallback((connection: Connection) => {
    updateState({
      connections: [...currentState.connections, connection]
    });
  }, [currentState.connections, updateState]);

  const selectNodes = useCallback((nodeIds: string[], multiSelect = false) => {
    if (multiSelect) {
      const newSelected = [...new Set([...currentState.selectedNodes, ...nodeIds])];
      updateState({ selectedNodes: newSelected });
    } else {
      updateState({ selectedNodes: nodeIds });
    }
  }, [currentState.selectedNodes, updateState]);

  const createGroup = useCallback((nodeIds: string[]) => {
    const nodesToGroup = currentState.nodes.filter(n => nodeIds.includes(n.id));
    if (nodesToGroup.length < 2) return;

    const minX = Math.min(...nodesToGroup.map(n => n.position.x));
    const minY = Math.min(...nodesToGroup.map(n => n.position.y));
    const maxX = Math.max(...nodesToGroup.map(n => n.position.x + 200));
    const maxY = Math.max(...nodesToGroup.map(n => n.position.y + 100));

    const newGroup: WorkflowGroup = {
      id: `group_${Date.now()}`,
      label: 'Node Group',
      position: { x: minX - 20, y: minY - 40 },
      size: { width: maxX - minX + 40, height: maxY - minY + 60 },
      color: '#e2e8f0',
      nodes: nodeIds
    };

    updateState({
      groups: [...currentState.groups, newGroup]
    });
  }, [currentState, updateState]);

  return {
    state: currentState,
    updateState,
    undo,
    redo,
    canUndo,
    canRedo,
    // Helper methods
    addNode,
    updateNode,
    deleteNodes,
    addConnection,
    selectNodes,
    createGroup
  };
};
