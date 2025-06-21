'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Zap, Globe, Clock, Mail, Database, Code, Filter, GitMerge, Webhook, Settings, Search, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';

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
  search: { icon: Search, color: '#FF9F43' },
  default: { icon: Settings, color: '#9CA3AF' },
};

interface WorkflowNodeProps extends NodeProps {
  deleteNode: (id: string) => void;
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ data, id, deleteNode }) => {
  const { type, label, status, executionTime } = data;
  const { icon: Icon, color } = NODE_DETAILS[type] || NODE_DETAILS.default;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'success': return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50' };
      case 'error': return { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-50' };
      case 'running': return { icon: Loader, color: 'text-blue-500', bgColor: 'bg-blue-50' };
      default: return { icon: AlertCircle, color: 'text-gray-500', bgColor: 'bg-gray-50' };
    }
  };

  const { icon: StatusIcon, color: statusColor, bgColor: statusBgColor } = getStatusInfo(status);

  return (
    <div className="w-64 bg-white rounded-lg shadow-lg border-l-4 transition-all duration-200 ease-in-out hover:shadow-xl" style={{ borderLeftColor: color }}>
      <Card className="border-0 rounded-lg overflow-hidden m-0 p-0 bg-transparent">
        <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}1A` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <CardTitle className="text-sm font-semibold text-gray-800 flex-1 truncate">{label}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded-full"
            onClick={() => deleteNode && deleteNode(id)}
          >
            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
          </Button>
        </CardHeader>

        <CardContent className="pt-1 pb-2.5 px-4 text-xs">
          <div className="flex justify-between items-center text-gray-500">
            <Badge variant="outline" className={`text-xs capitalize border-0 px-2 py-1 rounded-md font-medium ${statusBgColor}`}>
              <StatusIcon className={`w-3.5 h-3.5 mr-1.5 ${statusColor} ${status === 'running' ? 'animate-spin' : ''}`} />
              <span className={`${statusColor}`}>{status}</span>
            </Badge>
            {executionTime && (
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{Math.round(executionTime)}ms</span>
            )}
          </div>
        </CardContent>
      </Card>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: color, width: '10px', height: '10px' }}
        className="!bg-gray-300 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: color, width: '10px', height: '10px' }}
        className="!bg-gray-300 !border-2 !border-white"
      />
    </div>
  );
};

export default memo(WorkflowNode);
