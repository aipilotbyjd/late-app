'use client';

import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Settings,
  X,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Code,
  Zap,
  Mail,
  Database,
  Filter,
  Clock,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { WorkflowNode } from '@/types/workflow';

// Node type icons mapping
interface NodePropertiesPanelProps {
  selectedNode: WorkflowNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onClose?: () => void;
}

const nodeTypeIcons: Record<string, React.ReactNode> = {
  webhook: <Zap className="w-4 h-4" />,
  http: <Code className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  database: <Database className="w-4 h-4" />,
  filter: <Filter className="w-4 h-4" />,
  schedule: <Clock className="w-4 h-4" />,
  default: <Settings className="w-4 h-4" />
};

const statusColors: Record<string, string> = {
  running: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  idle: 'bg-gray-100 text-gray-800'
};

const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  selectedNode,
  onUpdateNode,
  onClose
}) => {
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodeConfig, setNodeConfig] = useState<Record<string, any>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('settings');

  useEffect(() => {
    if (selectedNode) {
      setNodeLabel(selectedNode.data.label);
      setNodeConfig(selectedNode.data.parameters || {});
    }
  }, [selectedNode]);

  useEffect(() => {
    if (selectedNode) {
      const firstTab = Object.keys(getNodeFields(selectedNode.type || '')).length > 0 ? Object.keys(getNodeFields(selectedNode.type || ''))[0] : 'settings';
      setActiveTab(firstTab);
    }
  }, [selectedNode?.id]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Any additional save logic here
    } finally {
      setIsSaving(false);
    }
  };

  // Get the fields for the current node type
  const nodeFields = getNodeFields(selectedNode?.type || '');

  // Check if we have multiple tabs to show
  const hasMultipleTabs = Object.keys(nodeFields).length > 1;

  // Get node status with a default value
  const nodeStatus = selectedNode?.data?.status || 'idle';

  // Get node icon based on type
  const nodeIcon = nodeTypeIcons[selectedNode?.type || ''] || nodeTypeIcons.default;

  const renderField = (fieldKey: string, fieldConfig: any) => {
    const value = nodeConfig[fieldKey] ?? fieldConfig.default ?? '';
    const isRequired = fieldConfig.required || false;
    const hasError = isRequired && !value && nodeConfig[fieldKey] !== undefined;

    const field = (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-slate-700">
            {fieldConfig.label}
            {isRequired && <span className="text-red-500 ml-0.5">*</span>}
          </Label>
          {fieldConfig.type === 'secret' && (
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              Reveal
            </Button>
          )}
        </div>

        {fieldConfig.description && (
          <p className="text-xs text-slate-500 mb-1.5">{fieldConfig.description}</p>
        )}

        {fieldConfig.type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={(e) => handleConfigChange(fieldKey, e.target.value)}
            className={cn("min-h-[80px] text-sm", hasError && "border-red-500")}
            placeholder={fieldConfig.placeholder}
          />
        ) : fieldConfig.type === 'select' ? (
          <Select
            value={value}
            onValueChange={(val) => handleConfigChange(fieldKey, val)}
          >
            <SelectTrigger className={cn("w-full", hasError && "border-red-500")}>
              <SelectValue placeholder={fieldConfig.placeholder || `Select ${fieldConfig.label}`} />
            </SelectTrigger>
            <SelectContent>
              {fieldConfig.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : fieldConfig.type === 'switch' ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">{fieldConfig.label}</span>
            <Switch
              checked={!!value}
              onCheckedChange={(val) => handleConfigChange(fieldKey, val)}
            />
          </div>
        ) : fieldConfig.type === 'code' ? (
          <div className="relative">
            <div className="absolute right-2 top-2 z-10">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <Code className="h-3.5 w-3.5 mr-1" />
                {fieldConfig.language || 'Code'}
              </Button>
            </div>
            <Textarea
              value={value}
              onChange={(e) => handleConfigChange(fieldKey, e.target.value)}
              className={cn("font-mono text-sm pt-8 min-h-[120px]", hasError && "border-red-500")}
              placeholder={fieldConfig.placeholder}
            />
          </div>
        ) : (
          <Input
            type={fieldConfig.type || 'text'}
            value={value}
            onChange={(e) => handleConfigChange(fieldKey, e.target.value)}
            placeholder={fieldConfig.placeholder}
            className={hasError ? "border-red-500" : ""}
          />
        )}

        {hasError && (
          <p className="text-xs text-red-500 flex items-center mt-1">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            This field is required
          </p>
        )}
      </div>
    );

    if (fieldConfig.section) {
      const isExpanded = expandedSections[fieldConfig.section] !== false;

      return (
        <div key={fieldKey} className="space-y-3">
          {!expandedSections.hasOwnProperty(fieldConfig.section) && (
            <button
              type="button"
              onClick={() => toggleSection(fieldConfig.section)}
              className="flex items-center w-full text-left text-sm font-medium text-slate-800 hover:text-slate-900"
            >
              <span className="mr-2">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
              {fieldConfig.section}
            </button>
          )}
          {isExpanded && (
            <div className="pl-6 space-y-4">
              {field}
            </div>
          )}
        </div>
      );
    }

    return field;
  };

  function getNodeFields(nodeType: string): Record<string, any> {
    const fields: Record<string, any> = {
      webhook: {
        settings: {
          url: {
            type: 'text',
            label: 'Webhook URL',
            placeholder: 'https://example.com/webhook',
            required: true,
            description: 'The URL that will trigger this workflow',
            section: 'Basic Settings'
          },
          method: {
            type: 'select',
            label: 'HTTP Method',
            options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            default: 'POST',
            section: 'Basic Settings'
          },
          responseMode: {
            type: 'select',
            label: 'Response',
            options: ['Last Node', 'Response Node'],
            description: 'Which node should respond to the webhook',
            section: 'Basic Settings'
          }
        },
        authentication: {
          authType: {
            type: 'select',
            label: 'Authentication',
            options: ['None', 'Basic Auth', 'API Key', 'OAuth2'],
            default: 'None',
            section: 'Authentication'
          },
          username: {
            type: 'text',
            label: 'Username',
            section: 'Authentication',
            showWhen: { field: 'authType', value: 'Basic Auth' }
          },
          password: {
            type: 'secret',
            label: 'Password',
            section: 'Authentication',
            showWhen: { field: 'authType', value: 'Basic Auth' }
          },
          apiKey: {
            type: 'secret',
            label: 'API Key',
            section: 'Authentication',
            showWhen: { field: 'authType', value: 'API Key' }
          }
        },
        options: {
          rawBody: {
            type: 'switch',
            label: 'Raw Body',
            default: false,
            description: 'Send the raw body instead of JSON',
            section: 'Options'
          },
          responseData: {
            type: 'select',
            label: 'Response Data',
            options: ['All data', 'First entry data', 'No data'],
            default: 'All data',
            description: 'What data to return in the webhook response',
            section: 'Options'
          }
        }
      },
      http: {
        settings: {
          url: {
            type: 'text',
            label: 'URL',
            placeholder: 'https://api.example.com/endpoint',
            required: true,
            section: 'Request'
          },
          method: {
            type: 'select',
            label: 'Method',
            options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
            default: 'GET',
            section: 'Request'
          },
          body: {
            type: 'code',
            label: 'Body',
            language: 'json',
            placeholder: '{\n  \"key\": \"value\"\n}',
            section: 'Request'
          }
        },
        parameters: {
          queryParams: {
            type: 'textarea',
            label: 'Query Parameters',
            placeholder: 'param1=value1\nparam2=value2',
            section: 'Parameters'
          },
          headers: {
            type: 'code',
            label: 'Headers',
            language: 'json',
            placeholder: '{\n  \"Content-Type\": \"application/json\"\n}',
            section: 'Parameters'
          }
        }
      },
      email: {
        settings: {
          to: {
            type: 'text',
            label: 'To',
            placeholder: 'recipient@example.com',
            required: true,
            section: 'Basic Settings'
          },
          subject: {
            type: 'text',
            label: 'Subject',
            placeholder: 'Email subject',
            section: 'Basic Settings'
          },
          body: {
            type: 'textarea',
            label: 'Message',
            placeholder: 'Email content',
            section: 'Basic Settings'
          },
          isHtml: {
            type: 'switch',
            label: 'HTML Format',
            section: 'Basic Settings'
          }
        }
      },
      database: {
        connection: {
          type: {
            type: 'select',
            label: 'Database Type',
            options: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'SQL Server'],
            section: 'Connection',
            required: true
          },
          host: {
            type: 'text',
            label: 'Host',
            placeholder: 'localhost',
            section: 'Connection',
            required: true
          },
          port: {
            type: 'text',
            label: 'Port',
            placeholder: '5432',
            section: 'Connection'
          },
          database: {
            type: 'text',
            label: 'Database Name',
            section: 'Connection',
            required: true
          },
          username: {
            type: 'text',
            label: 'Username',
            section: 'Authentication'
          },
          password: {
            type: 'password',
            label: 'Password',
            section: 'Authentication'
          },
        },
        query: {
          query: {
            type: 'textarea',
            label: 'SQL Query',
            placeholder: 'SELECT * FROM users WHERE status = :status',
            section: 'Query',
            required: true
          },
          params: {
            type: 'textarea',
            label: 'Parameters',
            placeholder: 'status=active',
            section: 'Query',
            description: 'One parameter per line in key=value format'
          }
        }
      },
      filter: {
        condition: {
          type: 'textarea',
          label: 'Filter Condition',
          placeholder: 'return data.value > 10;',
          description: 'JavaScript expression that returns true/false',
          section: 'Condition'
        }
      },
      schedule: {
        schedule: {
          cron: {
            type: 'text',
            label: 'Cron Expression',
            placeholder: '0 * * * *',
            description: 'Cron expression for scheduling (e.g., "0 * * * *" for hourly)',
            section: 'Schedule',
            required: true
          },
          timezone: {
            type: 'text',
            label: 'Timezone',
            placeholder: 'UTC',
            defaultValue: 'UTC',
            section: 'Schedule'
          },
          runOnStartup: {
            type: 'switch',
            label: 'Run on Workflow Start',
            description: 'Run the workflow immediately when it is started',
            section: 'Schedule'
          }
        }
      }
    };

    return fields[nodeType] || {};
  };

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-sm font-medium text-slate-800 uppercase tracking-wider">Node Properties</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
          <div className="text-center text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">No node selected</h3>
            <p className="text-xs text-slate-400">Click on a node to configure its properties</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center space-x-2">
          <div className={cn("p-1.5 rounded", statusColors[nodeStatus])}>
            {nodeIcon}
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-800">
              {selectedNode.data.label || selectedNode.type}
            </h2>
            <div className="flex items-center">
              <span className={cn(
                'w-2 h-2 rounded-full mr-1',
                nodeStatus === 'running' ? 'bg-blue-500' :
                  nodeStatus === 'success' ? 'bg-green-500' :
                    nodeStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
              )}></span>
              <span className="text-xs text-slate-500 capitalize">{nodeStatus}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
          aria-label="Close properties"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue={Object.keys(nodeFields)[0] || 'settings'}
        className="flex-1 flex flex-col h-0"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        {hasMultipleTabs && (
          <TabsList className="px-3 pt-2 pb-0 bg-transparent border-b border-slate-200 rounded-none h-10">
            {Object.entries(nodeFields).map(([tabKey, tabContent]) => (
              <TabsTrigger
                key={tabKey}
                value={tabKey}
                className="text-xs px-3 py-1.5 h-8 data-[state=active]:shadow-[0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-blue-500 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none"
              >
                {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Node Label */}
          <div>
            <Label className="text-xs font-medium text-slate-700 mb-1.5 block">Node Label</Label>
            <Input
              value={nodeLabel}
              onChange={handleLabelChange}
              placeholder="Enter a label for this node"
              className="text-sm mb-4"
            />

            {/* Node Type */}
            <div className="mb-4">
              <Label className="text-xs font-medium text-slate-700 mb-1.5 block">Node Type</Label>
              <div className="text-sm text-slate-900 bg-slate-100 px-3 py-2 rounded-md">
                {selectedNode.type}
              </div>
            </div>

            {/* Node Configuration */}
            {Object.entries(nodeFields).map(([tabKey, tabContent]) => (
              <TabsContent key={tabKey} value={tabKey} className="space-y-4">
                {Object.entries(tabContent as Record<string, any>).map(([fieldKey, fieldConfig]) => (
                  <React.Fragment key={fieldKey}>
                    {renderField(fieldKey, fieldConfig)}
                  </React.Fragment>
                ))}
              </TabsContent>
            ))}
          </div>

          {/* Execution Status */}
          <Card className="mt-6">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-slate-800">Execution</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Status</span>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    selectedNode.data.status === 'success' ? 'bg-green-100 text-green-800' :
                      selectedNode.data.status === 'error' ? 'bg-red-100 text-red-800' :
                        selectedNode.data.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-800'
                  )}>
                    {selectedNode.data.status || 'idle'}
                  </span>
                </div>

                {selectedNode.data.executionTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Execution Time</span>
                    <span className="text-sm font-mono text-slate-900">
                      {Math.round(selectedNode.data.executionTime)}ms
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
};

export default NodePropertiesPanel;
