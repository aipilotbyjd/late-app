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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const openModalForAdd = () => {
    setIsAdding(true);
    setNewWorkflowName('');
    setNewWorkflowDescription('');
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (workflow: Workflow) => {
    setIsAdding(false);
    setEditingId(workflow.id);
    setEditName(workflow.name);
    setEditDescription(workflow.description);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

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
      closeModal();
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

  const handleEditWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null || !editName.trim()) return;

    const updatedWorkflow = {
      name: editName,
      description: editDescription,
    };

    try {
      const response = await fetch(`/api/workflows/${editingId}`, {
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
        workflow.id === editingId ? updated : workflow
      ));
      closeModal();
    } catch (err) {
      console.error(err);
      setError('Failed to update workflow. Please try again.');
    }
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
    <div className="w-full h-full overflow-auto p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Workflows</h1>
        <Button onClick={openModalForAdd} className="bg-blue-600 hover:bg-blue-700 text-white">Add Workflow</Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input 
          placeholder="Search workflows..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading workflows...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="text-center py-10">No workflows found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {currentWorkflows.map((workflow) => (
              <motion.div
                key={workflow.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">{workflow.name}</h2>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openModalForEdit(workflow)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteWorkflow(workflow.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{workflow.description}</p>
                <p className="text-sm text-gray-500">Created: {new Date(workflow.createdAt).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {totalItems > 0 && (
        <div className="flex justify-between items-center mt-6">
          <Button 
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button 
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div 
              className="bg-white rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">{isAdding ? 'Add New Workflow' : 'Edit Workflow'}</h2>
              <form onSubmit={isAdding ? handleAddWorkflow : handleEditWorkflow}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <Input 
                    value={isAdding ? newWorkflowName : editName} 
                    onChange={(e) => isAdding ? setNewWorkflowName(e.target.value) : setEditName(e.target.value)} 
                    placeholder="Workflow name" 
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Textarea 
                    value={isAdding ? newWorkflowDescription : editDescription} 
                    onChange={(e) => isAdding ? setNewWorkflowDescription(e.target.value) : setEditDescription(e.target.value)} 
                    placeholder="Workflow description" 
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">{isAdding ? 'Add' : 'Save'}</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkflowsPage;
