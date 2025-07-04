'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Trash2, Edit, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Workflow } from "@/types/workflow";
import { useOrganization } from "@/context/OrganizationContext";

// Create axios instance with base config
const api = axios.create({
  baseURL: 'http://late-api.test/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Request Error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

const WorkflowsPage = () => {
  const router = useRouter();
  const { selectedOrganization } = useOrganization();
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
        const response = await api.get('/workflows');
        setWorkflows(response.data.data || []);
      } catch (err) {
        const errorMessage = axios.isAxiosError(err)
          ? `Failed to load workflows: ${err.response?.data?.message || err.message}`
          : `Failed to load workflows: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMessage);
        console.error('Error fetching workflows:', err);
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
    setEditDescription(workflow.description || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) {
      setError('Workflow name is required');
      return;
    }

    if (!selectedOrganization?.id) {
      setError('Please select an organization before creating a workflow');
      return;
    }

    const workflowData = {
      organization_id: selectedOrganization.id,
      name: newWorkflowName,
      description: newWorkflowDescription || '',
      workflow_json: {
        nodes: [],
        edges: []
      },
      status: 'draft'
    };

    console.log('Sending workflow data:', workflowData);
    console.log('Auth token:', localStorage.getItem('token'));

    try {
      setIsAdding(true);
      const response = await api.post('/workflows', workflowData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });

      console.log('Workflow created successfully:', response.data);

      const addedWorkflow = response.data;
      setWorkflows([...workflows, addedWorkflow]);
      closeModal();
      setNewWorkflowName('');
      setNewWorkflowDescription('');
      router.push(`/workflows/editor/${addedWorkflow.id}`);
    } catch (err: any) {
      console.error('Detailed error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        config: err.config
      });

      let errorMessage = 'Failed to create workflow';

      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with an error status code
          errorMessage = err.response.data?.message ||
            `Server responded with status ${err.response.status}`;
        } else if (err.request) {
          // Request was made but no response received
          errorMessage = 'No response from server. Please check your connection.';
          if (err.message === 'Network Error') {
            errorMessage += ' This is likely a CORS issue. Make sure the backend is properly configured.';
          }
        } else {
          // Something else happened
          errorMessage = `Request setup error: ${err.message}`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteWorkflow = async (id: number) => {
    try {
      await api.delete(`/workflows/${id}`);
      setWorkflows(workflows.filter(workflow => workflow.id !== id));
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? `Failed to delete workflow: ${err.response?.data?.message || err.message}`
        : `Failed to delete workflow: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      console.error('Error deleting workflow:', err);
    }
  };

  const handleEditWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null || !editName.trim()) return;

    try {
      const response = await api.put(`/workflows/${editingId}`, {
        name: editName,
        description: editDescription,
      });

      setWorkflows(workflows.map(workflow =>
        workflow.id === editingId ? response.data : workflow
      ));
      closeModal();
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? `Failed to update workflow: ${err.response?.data?.message || err.message}`
        : `Failed to update workflow: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      console.error('Error updating workflow:', err);
    }
  };

  // Filtering and pagination
  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (workflow.description || '').toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="w-full h-full overflow-auto p-6 max-w-7xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text tracking-tight">
            Workflows
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and automate your processes</p>
        </div>
      </div>

      <div className="relative mb-8 bg-white/60 dark:bg-gray-900/50 backdrop-blur-lg rounded-full shadow-inner border border-white/40 dark:border-gray-700 overflow-hidden">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search workflows..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10 h-12 bg-transparent border-0 focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 animate-pulse">Loading workflows...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800">{error}</div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          No workflows found. {searchTerm ? 'Try different search terms.' : 'Create your first workflow to get started.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {currentWorkflows.map((workflow) => (
              <motion.div
                key={workflow.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-white/40 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1">{workflow.name}</h2>
                    <div className="flex space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openModalForEdit(workflow)}
                            className="h-8 w-8 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/40 hover:bg-white/70 dark:hover:bg-gray-800/60"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteWorkflow(workflow.id)}
                            className="h-8 w-8 border-gray-200 dark:border-gray-700 text-red-500 bg-white/50 dark:bg-gray-800/40 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{workflow.description || 'No description provided'}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                    Created: {workflow.created_at ? new Date(workflow.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center mt-8 flex-wrap gap-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-2"
          >
            <option value={3}>3</option>
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-9 w-9 p-0 border-gray-200 dark:border-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 min-w-[120px] text-center">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-9 w-9 p-0 border-gray-200 dark:border-gray-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={openModalForAdd}
        size="icon"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-transform z-40"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4 border border-gray-100 dark:border-gray-700"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{isAdding ? 'Create New Workflow' : 'Edit Workflow'}</h2>
              <form onSubmit={isAdding ? handleAddWorkflow : handleEditWorkflow} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Workflow Name <span className="text-red-500">*</span></label>
                  <Input
                    value={isAdding ? newWorkflowName : editName}
                    onChange={(e) => isAdding ? setNewWorkflowName(e.target.value) : setEditName(e.target.value)}
                    placeholder="Enter workflow name"
                    required
                    className="h-10 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                  <Textarea
                    value={isAdding ? newWorkflowDescription : editDescription}
                    onChange={(e) => isAdding ? setNewWorkflowDescription(e.target.value) : setEditDescription(e.target.value)}
                    placeholder="Describe your workflow"
                    rows={3}
                    className="border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    {isAdding ? 'Create Workflow' : 'Save Changes'}
                  </Button>
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
