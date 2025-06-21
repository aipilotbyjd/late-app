
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Zap,
  Globe,
  Clock,
  Mail,
  Database,
  Code,
  Filter,
  GitMerge,
  Webhook,
  Calendar
} from 'lucide-react';

interface NodePaletteProps {
  onAddNode: (nodeType: string, position: { x: number; y: number }) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const nodeTypes = [
    { type: 'trigger', label: 'Trigger', icon: Zap, color: 'bg-green-500', description: 'Start workflow' },
    { type: 'webhook', label: 'Webhook', icon: Webhook, color: 'bg-blue-500', description: 'HTTP webhook' },
    { type: 'schedule', label: 'Schedule', icon: Calendar, color: 'bg-purple-500', description: 'Time-based trigger' },
    { type: 'http', label: 'HTTP Request', icon: Globe, color: 'bg-orange-500', description: 'Make HTTP calls' },
    { type: 'email', label: 'Email', icon: Mail, color: 'bg-red-500', description: 'Send emails' },
    { type: 'database', label: 'Database', icon: Database, color: 'bg-indigo-500', description: 'Database operations' },
    { type: 'code', label: 'Code', icon: Code, color: 'bg-yellow-600', description: 'Execute code' },
    { type: 'filter', label: 'Filter', icon: Filter, color: 'bg-teal-500', description: 'Filter data' },
    { type: 'merge', label: 'Merge', icon: GitMerge, color: 'bg-pink-500', description: 'Merge data' }
  ];

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    console.log('Drag started for node type:', nodeType);
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'copy';

    // Add visual feedback
    const dragImage = new Image();
    dragImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjMzMzIiBmaWxsLW9wYWNpdHk9IjAuOCIvPjx0ZXh0IHg9IjUwIiB5PSIyNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Ob2RlPC90ZXh0Pjwvc3ZnPg==';
    e.dataTransfer.setDragImage(dragImage, 50, 20);
  };

  const handleNodeClick = (nodeType: string) => {
    // Add node at center of canvas
    const position = { x: 400, y: 200 };
    onAddNode(nodeType, position);
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Node Palette</h2>
        <p className="text-sm text-slate-600">Drag or click to add nodes</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {nodeTypes.map((nodeType) => {
          const IconComponent = nodeType.icon;
          return (
            <Card
              key={nodeType.type}
              className="p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 hover:scale-102 select-none"
              draggable
              onDragStart={(e) => handleDragStart(e, nodeType.type)}
              onClick={() => handleNodeClick(nodeType.type)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${nodeType.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-800">{nodeType.label}</h3>
                  <p className="text-xs text-slate-500">{nodeType.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-600">
          💡 Tip: Drag nodes to canvas or click to add at center
        </div>
      </div>
    </div>
  );
};

export default NodePalette;
