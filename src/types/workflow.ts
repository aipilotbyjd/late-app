export interface WorkflowNodeData {
  label: string;
  type: string;
  parameters: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  executionTime?: number;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: WorkflowNodeData;
  selected?: boolean;
  group?: string;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
  status?: 'idle' | 'active' | 'error';
}

export interface NodeType {
  type: string;
  label: string;
  icon: string;
  category: string;
  description: string;
  color: string;
  inputs?: number;
  outputs?: number;
  canHaveMultipleInputs?: boolean;
  canHaveMultipleOutputs?: boolean;
}

export interface WorkflowGroup {
  id: string;
  label: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  nodes: string[];
}

export interface WorkflowState {
  nodes: WorkflowNode[];
  connections: Connection[];
  groups: WorkflowGroup[];
  selectedNodes: string[];
  viewport: { x: number; y: number; zoom: number };
}

export interface WorkflowAction {
  type: string;
  payload: any;
  timestamp: number;
}

export interface Workflow {
  id: number;
  organization_id?: number;
  name: string;
  description?: string;
  workflow_json?: {
    nodes: any[];
    edges: any[];
  };
  status?: string;
  created_at?: string;
  updated_at?: string;
}
