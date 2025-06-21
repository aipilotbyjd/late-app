'use client';

import React, { useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { X, Zap, Clock, CheckCircle, AlertCircle, Pause, Play, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WorkflowNode as WorkflowNodeType } from '@/types/workflow';

interface WorkflowNodeProps extends NodeProps<WorkflowNodeType['data']> {
  deleteNode: (id: string) => void;
}

// Node type definitions with colors and icons
const NODE_TYPES = {
  trigger: {
    color: '#FF6B6B',
    icon: <Zap className="w-4 h-4" />,
    label: 'Trigger',
  },
  webhook: {
    color: '#4D96FF',
    icon: <Zap className="w-4 h-4" />,
    label: 'Webhook',
  },
  schedule: {
    color: '#6C63FF',
    icon: <Clock className="w-4 h-4" />,
    label: 'Schedule',
  },
  http: {
    color: '#4D96FF',
    icon: <Zap className="w-4 h-4" />,
    label: 'HTTP Request',
  },
  email: {
    color: '#FF9F43',
    icon: <Zap className="w-4 h-4" />,
    label: 'Email',
  },
  database: {
    color: '#28C76F',
    icon: <Zap className="w-4 h-4" />,
    label: 'Database',
  },
  code: {
    color: '#EA5455',
    icon: <Zap className="w-4 h-4" />,
    label: 'Code',
  },
  filter: {
    color: '#00CFE8',
    icon: <Zap className="w-4 h-4" />,
    label: 'Filter',
  },
  merge: {
    color: '#9C27B0',
    icon: <Zap className="w-4 h-4" />,
    label: 'Merge',
  },
} as const;

const STATUS = {
  idle: {
    color: '#A0AEC0',
    icon: <Pause className="w-3 h-3" />,
    label: 'Idle',
  },
  running: {
    color: '#4D96FF',
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    label: 'Running',
  },
  success: {
    color: '#28C76F',
    icon: <CheckCircle className="w-3 h-3" />,
    label: 'Success',
  },
  error: {
    color: '#EA5455',
    icon: <AlertCircle className="w-3 h-3" />,
    label: 'Error',
  },
} as const;

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ data, id, selected, deleteNode }) => {
  const { type, label, status = 'idle', executionTime } = data;
  const nodeType = NODE_TYPES[type as keyof typeof NODE_TYPES] || NODE_TYPES.trigger;
  const nodeStatus = STATUS[status as keyof typeof STATUS] || STATUS.idle;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  return (
    <div className="relative">
      {/* Input Connection Point */}
      {type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2.5 !h-2.5 !border-2 !border-white !bg-gray-400"
          style={{ left: -6 }}
        />
      )}

      {/* Output Connection Point */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !border-2 !border-white !bg-gray-400"
        style={{ right: -6 }}
      />

      <Card
        className={cn(
          'w-64 bg-white border border-gray-200 rounded-md shadow-sm transition-all duration-150',
          'hover:shadow-md hover:border-gray-300',
          selected && 'ring-2 ring-blue-500 ring-offset-1',
        )}
        style={{
          borderTop: `3px solid ${nodeType.color}`,
        }}
      >
        <div className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${nodeType.color}15` }}
              >
                {React.cloneElement(nodeType.icon, {
                  className: cn('w-3.5 h-3.5', nodeType.icon.props.className),
                  style: { color: nodeType.color }
                })}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {label || nodeType.label}
                </h3>
                <p className="text-xs text-gray-500 capitalize">
                  {type}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {executionTime && (
                <span className="text-xs font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                  {Math.round(executionTime)}ms
                </span>
              )}
              <div
                className="w-2.5 h-2.5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${nodeStatus.color}20` }}
                title={nodeStatus.label}
              >
                {React.cloneElement(nodeStatus.icon, {
                  className: 'w-2 h-2',
                  style: { color: nodeStatus.color }
                })}
              </div>
            </div>
          </div>

          {selected && (
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 absolute -top-3 -right-3 bg-white border border-gray-200 rounded-full p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              onClick={handleDelete}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WorkflowNode;
