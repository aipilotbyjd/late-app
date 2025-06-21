'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Trash2, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Workflow {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

const WorkflowsPage = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    const fetchWorkflows = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/workflows');
        if (!response.ok) {
          throw new Error('Failed to fetch workflows');
        }
        const data = await response.json();
        setWorkflows(data.workflows || []);
      } catch (err) {
        setError('Failed to load workflows. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const handleAddWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;

    const newWorkflow = {
      name: newWorkflowName,
      description: newWorkflowDescription,
    };

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkflow),
      });

      if (!response.ok) {
        throw new Error('Failed to add workflow');
      }

      const addedWorkflow = await response.json();
      setWorkflows([...workflows, addedWorkflow]);
      setNewWorkflowName('');
      setNewWorkflowDescription('');
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      setError('Failed to add workflow. Please try again.');
    }
  };

  const handleDeleteWorkflow = async (id: number) => {
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete workflow');
      }

      setWorkflows(workflows.filter(workflow => workflow.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete workflow. Please try again.');
    }
  };

  const handleEditWorkflow = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const updatedWorkflow = {
      name: editName,
      description: editDescription,
    };

    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWorkflow),
      });

      if (!response.ok) {
        throw new Error('Failed to update workflow');
      }

      const updated = await response.json();
      setWorkflows(workflows.map(workflow =>
        workflow.id === id ? updated : workflow
      ));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError('Failed to update workflow. Please try again.');
    }
  };

  const startEditing = (workflow: Workflow) => {
    setEditingId(workflow.id);
    setEditName(workflow.name);
    setEditDescription(workflow.description);
  };

  // Filtering and pagination
  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredWorkflows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWorkflows = filteredWorkflows.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="w-full">
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Workflow Button */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {!isAdding ? (
          <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
            Add Workflow
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setIsAdding(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
        )}
      </motion.div>

      {/* Add Workflow Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <form onSubmit={handleAddWorkflow} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <Input
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder="Workflow name"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <Textarea
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  placeholder="Workflow description"
                  rows={3}
                />
              </div>
              <Button type="submit">Save Workflow</Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workflows List */}
      <div className="mb-6">
        {isLoading ? (
          <div className="py-8 text-center">Loading workflows...</div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="rounded-lg border bg-white p-6 text-center text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
            No workflows found. {searchTerm ? 'Try adjusting your search.' : 'Try adding a new workflow.'}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
          >
            <AnimatePresence mode="popLayout">
              {currentWorkflows.map((workflow) => (
                <motion.div
                  key={workflow.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800"
                >
                  {editingId === workflow.id ? (
                    <form onSubmit={(e) => handleEditWorkflow(e, workflow.id)} className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium">Name</label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Workflow name"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Description</label>
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Workflow description"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">Save</Button>
                        <Button type="button" variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="mb-2 text-lg font-semibold">{workflow.name}</div>
                      <div className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{workflow.description}</div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Created: {new Date(workflow.createdAt).toLocaleDateString()}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(workflow)}
                            aria-label="Edit workflow"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteWorkflow(workflow.id)}
                            aria-label="Delete workflow"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <motion.div
          className="flex flex-col items-center justify-between gap-4 border-t py-4 md:flex-row"
          key="pagination"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} workflows
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={page === currentPage ? "bg-gray-200 dark:bg-gray-700" : ""}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="rounded-md border bg-white p-2 text-sm dark:bg-gray-800"
            >
              <option value={3}>3 per page</option>
              <option value={6}>6 per page</option>
              <option value={9}>9 per page</option>
              <option value={12}>12 per page</option>
            </select>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WorkflowsPage;
