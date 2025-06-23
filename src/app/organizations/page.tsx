'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Trash2, Edit, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Organization } from "@/types/organization";
import WorkflowsLayout from "../workflows/layout";
import { useOrganization } from "@/context/OrganizationContext";
import axios from 'axios';
import { XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const OrganizationsPage = () => {
  const { organizations, setOrganizations, selectedOrganization, setSelectedOrganization, isLoading } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // true when modal is in "add" mode, false when editing existing organization
  const [isAddMode, setIsAddMode] = useState(false);
  // true while the add/edit network request is in-flight
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOrganizationName, setNewOrganizationName] = useState('');
  const [newOrganizationDescription, setNewOrganizationDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const fetchOrganizations = async () => {
    // This function is no longer needed as organizations are fetched in the context
    // Keep it for potential future use or manual refresh
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const openModalForAdd = () => {
    setIsAddMode(true);
    setNewOrganizationName('');
    setNewOrganizationDescription('');
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (organization: Organization) => {
    setIsAddMode(false);
    setEditingId(organization.id);
    setEditName(organization.name);
    setEditDescription(organization.description || '');
    setIsModalOpen(true);
  };

  const selectOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddOrganization = async () => {
    if (!newOrganizationName.trim()) {
      setError('Organization name is required');
      toast({
        title: 'Validation Error',
        description: 'Organization name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post('http://late-api.test/api/v1/organizations', {
        name: newOrganizationName,
        description: newOrganizationDescription || ''
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      const newOrganization = response.data.data || response.data;
      setOrganizations(prevOrgs => [...prevOrgs, newOrganization]);
      setSelectedOrganization(newOrganization);
      toast({
        title: "🎉 Organization Created",
        description: `${newOrganization.name} has been created successfully.`,
        className: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
        duration: 3000
      });
      closeModal();
    } catch (err) {
      console.error('Create organization error:', err);
      const errorMessage = err.response?.data?.message || (err instanceof Error ? err.message : 'Failed to create organization');
      setError(errorMessage);
      toast({
        title: 'Failed to Create Organization',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditOrganization = async () => {
    if (!editName.trim()) {
      setError('Organization name is required');
      toast({
        title: 'Validation Error',
        description: 'Organization name is required',
        variant: 'destructive'
      });
      return;
    }
    if (editingId === null) return;

    try {
      setIsSubmitting(true);
      const response = await axios.put(`http://late-api.test/api/v1/organizations/${editingId}`, {
        name: editName,
        description: editDescription || ''
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      const updatedOrganization = response.data.data || response.data;
      setOrganizations(prevOrgs => prevOrgs.map(org => org.id === editingId ? updatedOrganization : org));
      setSelectedOrganization(updatedOrganization);
      toast({
        title: "✅ Organization Updated",
        description: `Changes to ${updatedOrganization.name} have been saved successfully.`,
        className: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
        duration: 3000
      });
      closeModal();
    } catch (err) {
      console.error('Update organization error:', err);
      const errorMessage = err.response?.data?.message || (err instanceof Error ? err.message : 'Failed to update organization');
      setError(errorMessage);
      toast({
        title: 'Failed to Update Organization',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrganization = async (id: number) => {
    setIsDeleting(true);
    try {
      await axios.delete(`http://late-api.test/api/v1/organizations/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      const deletedOrg = organizations.find(org => org.id === id);
      setOrganizations(prevOrgs => prevOrgs.filter(org => org.id !== id));

      if (selectedOrganization?.id === id) {
        setSelectedOrganization(null);
      }

      toast({
        title: '🗑️ Organization Deleted',
        description: `${deletedOrg?.name || 'The organization'} has been deleted successfully.`,
        className: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
        duration: 5000
      });
    } catch (err) {
      console.error('Delete organization error:', err);
      const errorMessage = err.response?.data?.message || (err instanceof Error ? err.message : 'Failed to delete organization');
      toast({
        title: 'Failed to Delete Organization',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000
      });
      throw err; // Re-throw to handle in confirmDelete
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Delete Confirmation Helpers ---
  const requestDelete = (id: number) => {
    setPendingDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId === null) return;
    try {
      await handleDeleteOrganization(pendingDeleteId);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      // Error already handled in handleDeleteOrganization
    } finally {
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setPendingDeleteId(null);
  };

  const filteredOrganizations = (organizations || []).filter((organization: Organization) =>
    (organization.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (organization.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage);
  const paginatedOrganizations = filteredOrganizations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <WorkflowsLayout>
      <div className="w-full h-full overflow-auto p-6 max-w-7xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text tracking-tight">Organizations</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your organizations</p>
          </div>
        </div>

        <div className="relative mb-8 bg-white/60 dark:bg-gray-900/50 backdrop-blur-lg rounded-full shadow-inner border border-white/40 dark:border-gray-700 overflow-hidden">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search Organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-transparent border-0 focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400 animate-pulse">Loading Organizations...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800">{error}</div>
        ) : filteredOrganizations.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            No Organizations found. {searchTerm ? 'Try different search terms.' : 'Create your first organization to get started.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedOrganizations.map((organization: Organization, idx: number) => (
              <motion.div
                key={`${organization.id ?? 'org'}-${idx}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-white/40 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => selectOrganization(organization)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1">{organization.name}</h2>
                    <div className="flex space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModalForEdit(organization);
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              requestDelete(organization.id);
                            }}
                            className="h-8 w-8 border-gray-200 dark:border-gray-700 text-red-500 bg-white/50 dark:bg-gray-800/40 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{organization.description || 'No description provided'}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span>Created: {new Date(organization.created_at || '').toLocaleDateString()}</span>
                    {selectedOrganization?.id === organization.id && (
                      <span className="text-green-500 font-medium">Selected</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-8 flex-wrap gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-2"
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
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">{isAddMode ? 'Add New Organization' : 'Edit Organization'}</h2>
                  {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                      {isAddMode ? (
                        <Input
                          placeholder="Organization name"
                          value={newOrganizationName}
                          onChange={(e) => setNewOrganizationName(e.target.value)}
                          className="w-full rounded-md border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
                        />
                      ) : (
                        <Input
                          placeholder="Organization name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-md border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      {isAddMode ? (
                        <Textarea
                          placeholder="Organization description (optional)"
                          value={newOrganizationDescription}
                          onChange={(e) => setNewOrganizationDescription(e.target.value)}
                          className="w-full rounded-md border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
                          rows={3}
                        />
                      ) : (
                        <Textarea
                          placeholder="Organization description (optional)"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full rounded-md border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
                          rows={3}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button variant="outline" onClick={closeModal} className="rounded-md border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                      Cancel
                    </Button>
                    <Button onClick={isAddMode ? handleAddOrganization : handleEditOrganization} disabled={isSubmitting} className="rounded-md bg-blue-600 hover:bg-blue-700 text-white">
                      {isSubmitting ? 'Saving...' : isAddMode ? 'Add Organization' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Dialog */}
        <AnimatePresence>
          {isDeleteDialogOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={cancelDelete}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-900/20 dark:to-amber-900/10 p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-amber-100 dark:from-red-900/30 dark:to-amber-900/20 flex items-center justify-center shadow-inner">
                      <div className="w-12 h-12 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                        <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Delete Organization</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    This will permanently delete <span className="font-medium text-gray-700 dark:text-gray-200">
                      {organizations.find(org => org.id === pendingDeleteId)?.name || 'this organization'}</span> and all its associated data. This action cannot be undone.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={cancelDelete}
                      className="flex-1 rounded-lg h-11 transition-all duration-200 hover:shadow-sm"
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmDelete}
                      className="flex-1 rounded-lg h-11 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        'Delete Permanently'
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </WorkflowsLayout>
  );
};

export default OrganizationsPage;
