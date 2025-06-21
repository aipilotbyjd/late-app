'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

interface Workflow {
  id?: number;
  name: string;
  description: string;
  createdAt?: string;
}

const WorkflowsPage = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editWorkflowName, setEditWorkflowName] = useState('');
  const [editWorkflowDescription, setEditWorkflowDescription] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would fetch from an API endpoint that reads the JSON file
        // For simplicity in this example, we're using direct import (though in production this wouldn't be ideal)
        const response = await fetch('/api/workflows');
        if (!response.ok) {
          throw new Error(`Failed to fetch workflows: ${response.status}`);
        }
        const data = await response.json();
        setWorkflows(data.workflows);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflows');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const handleAddWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;

    try {
      const newWorkflow: Workflow = {
        name: newWorkflowName,
        description: newWorkflowDescription,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkflow),
      });

      if (!response.ok) {
        throw new Error(`Failed to add workflow: ${response.status}`);
      }

      const savedWorkflow = await response.json();
      setWorkflows([...workflows, savedWorkflow]);
      setNewWorkflowName('');
      setNewWorkflowDescription('');
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add workflow');
    }
  };

  const startEditing = (workflow: Workflow) => {
    setEditingId(workflow.id || 0);
    setEditWorkflowName(workflow.name);
    setEditWorkflowDescription(workflow.description);
  };

  const handleUpdateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editWorkflowName.trim()) return;

    try {
      const updatedWorkflow: Workflow = {
        id: editingId,
        name: editWorkflowName,
        description: editWorkflowDescription,
      };

      const response = await fetch(`/api/workflows/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWorkflow),
      });

      if (!response.ok) {
        throw new Error(`Failed to update workflow: ${response.status}`);
      }

      const savedWorkflow = await response.json();
      setWorkflows(workflows.map(w => w.id === editingId ? savedWorkflow : w));
      setEditingId(null);
      setEditWorkflowName('');
      setEditWorkflowDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workflow');
    }
  };

  const handleDeleteWorkflow = async (id: number) => {
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete workflow: ${response.status}`);
      }

      setWorkflows(workflows.filter(w => w.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2"
        >
          <PlusCircle size={18} />
          Add Workflow
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddWorkflow} className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Add New Workflow</h2>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              id="name"
              type="text"
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
              placeholder="Enter workflow name"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea
              id="description"
              value={newWorkflowDescription}
              onChange={(e) => setNewWorkflowDescription(e.target.value)}
              placeholder="Enter workflow description"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Workflow</Button>
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-10">Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 border rounded-lg">
          <p className="text-gray-500">No workflows found. Click &quot;Add Workflow&quot; to create your first workflow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {editingId === workflow.id ? (
                <form onSubmit={handleUpdateWorkflow} className="space-y-3">
                  <div>
                    <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input
                      id="editName"
                      type="text"
                      value={editWorkflowName}
                      onChange={(e) => setEditWorkflowName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Textarea
                      id="editDescription"
                      value={editWorkflowDescription}
                      onChange={(e) => setEditWorkflowDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">Save</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-1">{workflow.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{workflow.description}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(workflow)}
                      className="flex items-center gap-1"
                    >
                      <Edit size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteWorkflow(workflow.id || 0)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowsPage;
