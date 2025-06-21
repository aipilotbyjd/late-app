'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Zap, Globe, Clock, Mail, Database, Code, Filter, GitMerge, Webhook, Settings } from 'lucide-react';

const NODE_DETAILS: Record<string, { icon: React.ElementType; color: string }> = {
  trigger: { icon: Zap, color: '#FF6B6B' },
  webhook: { icon: Webhook, color: '#4D96FF' },
  schedule: { icon: Clock, color: '#6C63FF' },
  http: { icon: Globe, color: '#4D96FF' },
  email: { icon: Mail, color: '#FF9F43' },
  database: { icon: Database, color: '#28C76F' },
  code: { icon: Code, color: '#EA5455' },
  filter: { icon: Filter, color: '#00CFE8' },
  merge: { icon: GitMerge, color: '#9C27B0' },
  default: { icon: Settings, color: '#9CA3AF' },
};

interface WorkflowNodeProps extends NodeProps {
  deleteNode: (id: string) => void;
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ data, id, deleteNode }) => {
  const { type, label, status, executionTime } = data;
  const { icon: Icon, color } = NODE_DETAILS[type] || NODE_DETAILS.default;

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900 dark:text-green-200';
      case 'error': return 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900 dark:text-red-200';
      case 'running': return 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className={`w-64 shadow-md rounded-lg border-2 bg-white`} style={{ borderColor: color }}>
      <Card className="border-0 rounded-lg overflow-hidden m-0 p-0 bg-transparent">
        <CardHeader className="py-2 px-3 border-b flex flex-row items-center justify-between" style={{ borderColor: color, borderBottomWidth: '1px' }}>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <CardTitle className="text-sm font-medium flex-1 truncate">{label}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 hover:bg-gray-100 dark:hover:bg-slate-700"
            onClick={() => deleteNode && deleteNode(id)}
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400" />
          </Button>
        </CardHeader>

        <CardContent className="py-2 px-3 text-sm">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Status</span>
            <Badge variant="outline" className={`text-xs ${getStatusColor(status)} border capitalize`}>
              {status}
            </Badge>
          </div>
          {executionTime && (
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
              <span>Execution Time</span>
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{Math.round(executionTime)}ms</span>
            </div>
          )}
        </CardContent>
      </Card>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 rounded-full bg-gray-300 border-2 border-white dark:bg-slate-600 dark:border-slate-800"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 rounded-full bg-gray-300 border-2 border-white dark:bg-slate-600 dark:border-slate-800"
      />
    </div>
  );
};

export default memo(WorkflowNode);
