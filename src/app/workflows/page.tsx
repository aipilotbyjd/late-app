'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/workflows');
        if (!response.ok) {
          throw new Error(`Failed to fetch workflows: ${response.status}`);
        }
        const data = await response.json();
        setWorkflows(data.workflows || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflows');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  // Filter workflows based on search term
  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalItems = filteredWorkflows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWorkflows = filteredWorkflows.slice(startIndex, endIndex);

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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when changing pages
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

      <div className="mb-6 relative">
        <Input
          type="text"
          placeholder="Search workflows..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page when searching
          }}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </motion.div>
      )}

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleAddWorkflow}
            className="mb-6 p-4 border rounded-lg bg-gray-50 overflow-hidden"
          >
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
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-10">Loading workflows...</div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 border rounded-lg">
          <p className="text-gray-500">No workflows found matching your search. Try different keywords or click &quot;Add Workflow&quot; to create a new one.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <AnimatePresence>
              {currentWorkflows.map((workflow) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col items-center justify-between md:flex-row gap-4">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} workflows
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={page === currentPage ? "bg-primary text-white" : ""}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
                className="p-1 border rounded-md"
              >
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="9">9</option>
                <option value="12">12</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkflowsPage;
