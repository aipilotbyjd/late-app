'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Zap, Globe, Clock, Mail, Database, Code, Filter, GitMerge, Webhook, Calendar,
  ChevronDown, ChevronRight, Search, GripVertical, Settings, FileText, Cloud,
  Cpu, Server, GitBranch, AlertCircle, Hash, List, Type, CheckSquare, Image as ImageIcon
} from 'lucide-react';

interface NodeType {
  type: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  category: string;
  tags?: string[];
}

interface NodeCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface NodePaletteProps {
  onAddNode: (nodeType: string, position: { x: number; y: number }) => void;
}

const categories: NodeCategory[] = [
  { id: 'core', label: 'Core Nodes', icon: Cpu, color: '#4D96FF' },
  { id: 'trigger', label: 'Triggers', icon: Zap, color: '#FF6B6B' },
  { id: 'data', label: 'Data', icon: Database, color: '#28C76F' },
  { id: 'transform', label: 'Transform', icon: GitBranch, color: '#6C63FF' },
  { id: 'automation', label: 'Automation', icon: Settings, color: '#FF9F43' },
];

const nodeTypes: NodeType[] = [
  {
    type: 'trigger',
    label: 'Manual',
    icon: Zap,
    color: '#FF6B6B',
    description: 'Start workflow manually',
    category: 'trigger',
    tags: ['start', 'trigger']
  },
  {
    type: 'webhook',
    label: 'Webhook',
    icon: Webhook,
    color: '#4D96FF',
    description: 'Listen for HTTP requests',
    category: 'trigger',
    tags: ['http', 'api', 'trigger']
  },
  {
    type: 'schedule',
    label: 'Schedule',
    icon: Clock,
    color: '#6C63FF',
    description: 'Trigger on a schedule',
    category: 'trigger',
    tags: ['time', 'cron', 'trigger']
  },
  {
    type: 'http',
    label: 'HTTP Request',
    icon: Globe,
    color: '#4D96FF',
    description: 'Make HTTP requests',
    category: 'core',
    tags: ['api', 'rest', 'fetch']
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    color: '#FF9F43',
    description: 'Send and receive emails',
    category: 'core',
    tags: ['smtp', 'imap', 'notification']
  },
  {
    type: 'database',
    label: 'Database',
    icon: Database,
    color: '#28C76F',
    description: 'Query databases',
    category: 'data',
    tags: ['sql', 'nosql', 'query']
  },
  {
    type: 'search',
    label: 'Search',
    icon: Search,
    color: '#FF9F43',
    description: 'Search and filter data collections',
    category: 'data',
    tags: ['find', 'lookup', 'query', 'search']
  },
  {
    type: 'code',
    label: 'Code',
    icon: Code,
    color: '#EA5455',
    description: 'Execute custom code',
    category: 'core',
    tags: ['function', 'script', 'custom']
  },
  {
    type: 'filter',
    label: 'Filter',
    icon: Filter,
    color: '#00CFE8',
    description: 'Filter data',
    category: 'transform',
    tags: ['condition', 'if', 'filter']
  },
  {
    type: 'merge',
    label: 'Merge',
    icon: GitMerge,
    color: '#9C27B0',
    description: 'Merge data streams',
    category: 'transform',
    tags: ['join', 'combine', 'union']
  },
];

const NodeItem: React.FC<{ node: NodeType; onDragStart: (e: React.DragEvent, type: string) => void; onAddNode: (nodeType: string, position: { x: number; y: number }) => void }> = ({ node, onDragStart, onAddNode }) => {
  const Icon = node.icon;

  return (
    <div
      className={cn(
        'group flex items-center p-2.5 rounded-md cursor-grab',
        'hover:bg-gray-50 active:cursor-grabbing active:bg-gray-100',
        'transition-colors duration-150 select-none',
        'border border-transparent hover:border-gray-200'
      )}
      draggable
      onDragStart={(e) => onDragStart(e, node.type)}
      onClick={() => {
        const position = { x: 400, y: 200 };
        onAddNode(node.type, position);
      }}
    >
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mr-3"
        style={{ backgroundColor: `${node.color}15` }}
      >
        <Icon className="w-4 h-4" style={{ color: node.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">{node.label}</h3>
        <p className="text-xs text-gray-500 truncate">{node.description}</p>
      </div>
      <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const NodeCategorySection: React.FC<{
  category: NodeCategory;
  nodes: NodeType[];
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onDragStart: (e: React.DragEvent, type: string) => void;
  onAddNode: (nodeType: string, position: { x: number; y: number }) => void;
}> = ({ category, nodes, isExpanded, onToggle, onDragStart, onAddNode }) => {
  const Icon = category.icon;

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className={cn(
          'w-full flex items-center justify-between p-3 text-left',
          'hover:bg-gray-50 transition-colors duration-150',
          'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50 rounded'
        )}
        onClick={() => onToggle(category.id)}
      >
        <div className="flex items-center">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center mr-2"
            style={{ backgroundColor: `${category.color}15` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: category.color }} />
          </div>
          <span className="text-sm font-medium text-gray-900">{category.label}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="pb-2 px-1 space-y-1">
          {nodes.map((node) => (
            <NodeItem key={node.type} node={node} onDragStart={onDragStart} onAddNode={onAddNode} />
          ))}
        </div>
      )}
    </div>
  );
};

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add visual feedback
    const dragImage = new Image();
    dragImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjMzMzIiBmaWxsLW9wYWNpdHk9IjAuOCIvPjx0ZXh0IHg9IjUwIiB5PSIyNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Ob2RlPC90ZXh0Pjwvc3ZnPg==';
    e.dataTransfer.setDragImage(dragImage, 50, 20);
  };

  const uniqueNodeTypes = nodeTypes.filter((node, index, self) =>
    index === self.findIndex((t) => t.type === node.type)
  );

  // Filter nodes based on search query
  const filteredNodes = searchQuery
    ? uniqueNodeTypes.filter(node =>
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    : uniqueNodeTypes;

  // Group nodes by category
  const nodesByCategory = filteredNodes.reduce<Record<string, NodeType[]>>((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {});

  console.log('Available node types:', JSON.stringify(nodeTypes, null, 2));

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-y-auto">
        {searchQuery ? (
          // Show all matching nodes in a flat list when searching
          <div className="p-2 space-y-1">
            {filteredNodes.length > 0 ? (
              filteredNodes.map((node) => (
                <NodeItem key={node.type} node={node} onDragStart={handleDragStart} onAddNode={onAddNode} />
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                No nodes found
              </div>
            )}
          </div>
        ) : (
          // Show categorized nodes when not searching
          categories.map((category) => {
            const categoryNodes = nodesByCategory[category.id] || [];
            if (categoryNodes.length === 0) return null;

            return (
              <NodeCategorySection
                key={category.id}
                category={category}
                nodes={categoryNodes}
                isExpanded={!!expandedCategories[category.id]}
                onToggle={toggleCategory}
                onDragStart={handleDragStart}
                onAddNode={onAddNode}
              />
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          Drag & drop nodes onto the canvas
        </div>
      </div>
    </div>
  );
};

export default NodePalette;
