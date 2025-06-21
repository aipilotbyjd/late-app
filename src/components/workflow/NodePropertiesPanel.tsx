'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Settings, Info } from 'lucide-react';
import { WorkflowNode } from '@/types/workflow';

interface NodePropertiesPanelProps {
  selectedNode: WorkflowNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
}

const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  selectedNode,
  onUpdateNode
}) => {
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodeConfig, setNodeConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (selectedNode) {
      setNodeLabel(selectedNode.data.label);
      setNodeConfig(selectedNode.data.parameters || {});
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-slate-500">
            <Settings className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p>Select a node to view its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const handleLabelChange = (newLabel: string) => {
    setNodeLabel(newLabel);
    onUpdateNode(selectedNode.id, {
      data: { ...selectedNode.data, label: newLabel }
    });
  };

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...nodeConfig, [key]: value };
    setNodeConfig(newConfig);
    onUpdateNode(selectedNode.id, {
      data: { ...selectedNode.data, parameters: newConfig }
    });
  };

  const getNodeFields = (nodeType: string) => {
    const fields: Record<string, any> = {
      webhook: {
        url: { type: 'text', label: 'Webhook URL' },
        method: { type: 'select', label: 'HTTP Method', options: ['GET', 'POST', 'PUT', 'DELETE'] }
      },
      http: {
        url: { type: 'text', label: 'URL' },
        method: { type: 'select', label: 'Method', options: ['GET', 'POST', 'PUT', 'DELETE'] },
        headers: { type: 'textarea', label: 'Headers (JSON)' }
      },
      email: {
        to: { type: 'text', label: 'To Email' },
        subject: { type: 'text', label: 'Subject' },
        body: { type: 'textarea', label: 'Email Body' }
      },
      database: {
        query: { type: 'textarea', label: 'SQL Query' },
        connection: { type: 'text', label: 'Connection String' }
      },
      code: {
        language: { type: 'select', label: 'Language', options: ['javascript', 'python'] },
        code: { type: 'textarea', label: 'Code' }
      },
      filter: {
        condition: { type: 'text', label: 'Filter Condition' }
      },
      schedule: {
        cron: { type: 'text', label: 'Cron Expression' },
        timezone: { type: 'text', label: 'Timezone' }
      }
    };

    return fields[nodeType] || {};
  };

  const renderField = (key: string, field: any) => {
    const value = nodeConfig[key] || '';

    switch (field.type) {
      case 'select':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{field.label}</Label>
            <select
              id={key}
              value={value}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              {field.options?.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      case 'textarea':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{field.label}</Label>
            <Textarea
              id={key}
              value={value}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        );
      default:
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{field.label}</Label>
            <Input
              id={key}
              type="text"
              value={value}
              onChange={(e) => handleConfigChange(key, e.target.value)}
            />
          </div>
        );
    }
  };

  const nodeFields = getNodeFields(selectedNode.type);

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Properties</h2>
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <Info className="w-4 h-4" />
            <span>{selectedNode.type}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Properties */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-slate-800 mb-3">Basic Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="node-label">Node Label</Label>
              <Input
                id="node-label"
                value={nodeLabel}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Enter node label"
              />
            </div>

            <div className="space-y-2">
              <Label>Node ID</Label>
              <Input value={selectedNode.id} disabled className="bg-slate-50" />
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <div className="flex space-x-2">
                <Input
                  value={Math.round(selectedNode.position.x)}
                  disabled
                  className="bg-slate-50"
                  placeholder="X"
                />
                <Input
                  value={Math.round(selectedNode.position.y)}
                  disabled
                  className="bg-slate-50"
                  placeholder="Y"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Node-specific Configuration */}
        {Object.keys(nodeFields).length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-medium text-slate-800 mb-3">Configuration</h3>
            <div className="space-y-4">
              {Object.entries(nodeFields).map(([key, field]) => renderField(key, field))}
            </div>
          </Card>
        )}

        {/* Execution Status */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-slate-800 mb-3">Execution</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedNode.data.status === 'success' ? 'bg-green-100 text-green-800' :
                selectedNode.data.status === 'error' ? 'bg-red-100 text-red-800' :
                  selectedNode.data.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-800'
                }`}>
                {selectedNode.data.status || 'idle'}
              </span>
            </div>

            {selectedNode.data.executionTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Execution Time</span>
                <span className="text-sm font-mono">
                  {Math.round(selectedNode.data.executionTime)}ms
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NodePropertiesPanel;
