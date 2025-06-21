'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkflowNode as WorkflowNodeType } from '@/types/workflow';

const WorkflowNode: React.FC<NodeProps<WorkflowNodeType['data']>> = ({ data, id, selected }) => {
    const { type, label, status, executionTime } = data;

  const getNodeColor = (type: string) => {
    const colors = {
      trigger: 'bg-green-500',
      webhook: 'bg-blue-500',
      schedule: 'bg-purple-500',
      http: 'bg-orange-500',
      email: 'bg-red-500',
      database: 'bg-indigo-500',
      code: 'bg-yellow-600',
      filter: 'bg-teal-500',
      merge: 'bg-pink-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getNodeIcon = (type: string) => {
    const icons = {
      trigger: '▶️',
      webhook: '🌐',
      schedule: '⏰',
      http: '🌐',
      email: '📧',
      database: '🗄️',
      code: '💻',
      filter: '🔽',
      merge: '🔀'
    };
    return icons[type as keyof typeof icons] || '⚡';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running': return 'bg-blue-400 animate-pulse';
      case 'success': return 'bg-green-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-slate-400';
    }
  };

  

  return (
      <Card
        className={`w-48 bg-white shadow-lg transition-all duration-200 ${selected
          ? 'ring-2 ring-blue-500 shadow-xl scale-105'
          : 'hover:shadow-xl hover:scale-102'
          }`}
      >
        {/* Input Connection Point */}
        {type !== 'trigger' && (
          <Handle
            type="target"
            position={Position.Left}
            className="!bg-slate-300 w-3 h-3 border-2 border-white"
          />
        )}

        {/* Output Connection Point */}
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-slate-300 w-3 h-3 border-2 border-white"
        />

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${getNodeColor(type)} rounded-lg flex items-center justify-center text-white text-sm`}>
                {getNodeIcon(type)}
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-800">
                  {label}
                </h3>
                <p className="text-xs text-slate-500 capitalize">
                  {type}
                </p>
              </div>
            </div>

            
          </div>

          {/* Node Status and Info */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">
              {id.slice(-6)}
            </span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
              <span className="text-slate-500 capitalize">
                {status || 'ready'}
              </span>
            </div>
          </div>

          {/* Execution Time */}
          {executionTime && (
            <div className="mt-2 text-xs text-slate-500">
              Executed in {Math.round(executionTime)}ms
            </div>
          )}
        </div>
      </Card>
  );
};

export default WorkflowNode;
