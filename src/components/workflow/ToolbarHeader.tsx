
import React from 'react';
import { Play, Save, Download, Upload, Settings, Grid3X3, Eye, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ToolbarHeaderProps {
  onExecute: () => void;
  onSave: () => void;
  isExecuting: boolean;
  showGrid: boolean;
  onToggleGrid: () => void;
}

const ToolbarHeader: React.FC<ToolbarHeaderProps> = ({
  onExecute,
  onSave,
  isExecuting,
  showGrid,
  onToggleGrid
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">n8n Workflow Editor</h1>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={onExecute}
              disabled={isExecuting}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              {isExecuting ? 'Executing...' : 'Execute'}
            </Button>
            
            <Button onClick={onSave} variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={onToggleGrid}
            variant={showGrid ? "default" : "outline"}
            size="sm"
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Grid
          </Button>
          
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ToolbarHeader;
