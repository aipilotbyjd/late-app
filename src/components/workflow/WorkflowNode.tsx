'use client';

import React from 'react';
import { X, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkflowNode as WorkflowNodeType } from '@/types/workflow';

interface WorkflowNodeProps {
  node: WorkflowNodeType;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onConnectionStart: (nodeId: string, isOutput: boolean) => void;
  onConnectionEnd: (nodeId: string, isInput: boolean) => void;
  connecting: { nodeId: string; isOutput: boolean } | null;
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  node,
  isSelected,
  onMouseDown,
  onDelete,
  onConnectionStart,
  onConnectionEnd,
  connecting
}) => {
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

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConnectionEnd(node.id, true);
  };

  const handleOutputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConnectionStart(node.id, true);
  };

  const isConnectingToThis = connecting && connecting.nodeId === node.id;
  const canConnect = connecting && connecting.nodeId !== node.id;

  return (
    <div
      className="absolute select-none"
      style={{
        left: node.position.x,
        top: node.position.y,
        zIndex: isSelected ? 10 : 5
      }}
    >
      <Card
        className={`w-48 bg-white shadow-lg transition-all duration-200 cursor-move ${isSelected
          ? 'ring-2 ring-blue-500 shadow-xl scale-105'
          : 'hover:shadow-xl hover:scale-102'
          } ${isConnectingToThis ? 'ring-2 ring-purple-500' : ''}`}
        onMouseDown={onMouseDown}
      >
        {/* Input Connection Point */}
        {node.type !== 'trigger' && (
          <div
            className={`absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 rounded-full cursor-pointer transition-all z-10 ${canConnect && !connecting.isOutput
              ? 'border-green-500 scale-110'
              : 'border-slate-300 hover:border-blue-500'
              }`}
            onClick={handleInputClick}
          >
            <Circle className="w-2 h-2 text-slate-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        )}

        {/* Output Connection Point */}
        <div
          className={`absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 rounded-full cursor-pointer transition-all z-10 ${canConnect && connecting.isOutput
            ? 'border-green-500 scale-110'
            : 'border-slate-300 hover:border-blue-500'
            }`}
          onClick={handleOutputClick}
        >
          <Circle className="w-2 h-2 text-slate-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${getNodeColor(node.type)} rounded-lg flex items-center justify-center text-white text-sm`}>
                {getNodeIcon(node.type)}
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-800">
                  {node.data.label}
                </h3>
                <p className="text-xs text-slate-500 capitalize">
                  {node.type}
                </p>
              </div>
            </div>

            {isSelected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Node Status and Info */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">
              {node.id.slice(-6)}
            </span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(node.data.status)}`}></div>
              <span className="text-slate-500 capitalize">
                {node.data.status || 'ready'}
              </span>
            </div>
          </div>

          {/* Execution Time */}
          {node.data.executionTime && (
            <div className="mt-2 text-xs text-slate-500">
              Executed in {Math.round(node.data.executionTime)}ms
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WorkflowNode;
