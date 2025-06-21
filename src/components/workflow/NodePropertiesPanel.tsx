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
import { WorkflowNodeData } from '@/types/workflow';
import { motion, AnimatePresence } from 'framer-motion';

// Node type icons mapping
interface NodePropertiesPanelProps {
  selectedNode: Node<WorkflowNodeData> | null;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
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
    if (selectedNode) {
      onUpdateNode(selectedNode.id, { label: newLabel });
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...nodeConfig, [key]: value };
    setNodeConfig(newConfig);
    if (selectedNode) {
      onUpdateNode(selectedNode.id, { parameters: newConfig });
    }
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
      <motion.div
        className="w-80 bg-white shadow-lg p-6 flex flex-col items-center justify-center h-full border-l border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AlertCircle className="w-10 h-10 text-gray-400 mb-2" />
        <p className="text-gray-600 text-center text-sm">No node selected</p>
        <p className="text-gray-500 text-center text-xs mt-1">Select a node to view and edit its properties</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-80 bg-gradient-to-b from-white to-gray-50 shadow-xl flex flex-col h-full border-l border-gray-200"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 50, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <motion.span
            className="text-indigo-600"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >{nodeIcon}</motion.span>
          <h3 className="font-medium text-gray-800 text-sm truncate max-w-[220px]">{nodeLabel || selectedNode.type || 'Unnamed Node'}</h3>
          <Badge className={cn("ml-2", statusColors[nodeStatus])}>{nodeStatus}</Badge>
        </div>
        <motion.button
          variant="ghost"
          size="icon"
          className="w-7 h-7 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Close properties panel"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 pt-4 pb-6 space-y-5">
          <div className="space-y-3">
            <Label className="text-xs font-medium text-gray-700 px-1">Node Name</Label>
            <motion.div
              whileFocus={{ borderColor: '#4F46E5', boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.2)' }}
            >
              <Input
                value={nodeLabel}
                onChange={handleLabelChange}
                placeholder="Enter node name"
                className="text-sm h-9"
              />
            </motion.div>
          </div>

          {hasMultipleTabs ? (
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1" style={{ gridTemplateColumns: `repeat(${Object.keys(nodeFields).length}, 1fr)` }}>
                {Object.keys(nodeFields).map(tab => (
                  <motion.div
                    key={tab}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <TabsTrigger
                      value={tab}
                      className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-1.5 h-auto data-[state=active]:text-indigo-600 transition-colors"
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </TabsTrigger>
                  </motion.div>
                ))}
              </TabsList>
              <AnimatePresence mode="wait">
                {Object.entries(nodeFields).map(([tab, fields]) => (
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value={tab} className="space-y-4 mt-0">
                      <div className="space-y-4">
                        {Object.entries(fields).map(([fieldKey, fieldConfig]) => (
                          <div key={fieldKey} className="space-y-3.5">
                            {renderField(fieldKey, fieldConfig)}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Tabs>
          ) : (
            <div className="space-y-4 pt-2">
              {Object.entries(nodeFields.settings || {}).map(([fieldKey, fieldConfig]) => (
                <div key={fieldKey} className="space-y-3.5">
                  {renderField(fieldKey, fieldConfig)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-white flex justify-end">
        <motion.button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md transition-all duration-200 px-4 py-2 rounded-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default NodePropertiesPanel;
