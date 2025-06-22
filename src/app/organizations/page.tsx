'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Trash2, Edit, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Organization } from "@/types/organization";
import WorkflowsLayout from "../workflows/layout";
import { useOrganization } from "@/context/OrganizationContext";

const OrganizationsPage = () => {
  const { organizations, setOrganizations, selectedOrganization, setSelectedOrganization, isLoading } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newOrganizationName, setNewOrganizationName] = useState('');
  const [newOrganizationDescription, setNewOrganizationDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchOrganizations = async () => {
    // This function is no longer needed as organizations are fetched in the context
    // Keep it for potential future use or manual refresh
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const openModalForAdd = () => {
    setIsAdding(true);
    setNewOrganizationName('');
    setNewOrganizationDescription('');
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (organization: Organization) => {
    setIsAdding(false);
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
      return;
    }

    try {
      setIsAdding(true);
      const response = await fetch('http://late-api.test/api/v1/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: newOrganizationName,
          description: newOrganizationDescription || ''
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create organization: ${response.status} ${response.statusText}`);
      }

      const addedOrganization = await response.json();
      setOrganizations([...organizations, addedOrganization]);
      setSelectedOrganization(addedOrganization);
      closeModal();
      setNewOrganizationName('');
      setNewOrganizationDescription('');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditOrganization = async () => {
    if (!editName.trim()) {
      setError('Organization name is required');
      return;
    }
    if (editingId === null) return;

    try {
      setIsAdding(true);
      const response = await fetch(`http://late-api.test/api/v1/organizations/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription || ''
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update organization: ${response.status} ${response.statusText}`);
      }

      const updatedOrganization = await response.json();
      setOrganizations(organizations.map(org => org.id === editingId ? updatedOrganization : org));
      setSelectedOrganization(updatedOrganization);
      closeModal();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to update organization');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteOrganization = async (id: number) => {
    try {
      const response = await fetch(`http://late-api.test/api/v1/organizations/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete organization: ${response.status} ${response.statusText}`);
      }

      setOrganizations(organizations.filter(org => org.id !== id));
      setSelectedOrganization(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete organization: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const filteredOrganizations = organizations.filter(organization =>
    organization.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organization.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage);
  const paginatedOrganizations = filteredOrganizations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <WorkflowsLayout>
      <div className="w-full h-full overflow-auto p-6 max-w-7xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Organizations Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your Organizations with ease</p>
          </div>
          <Button
            onClick={openModalForAdd}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transform transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add organization
          </Button>
        </div>

        <div className="relative mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search Organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-0 focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-gray-700 dark:text-gray-200 bg-transparent"
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
            {paginatedOrganizations.map((organization: Organization) => (
              <motion.div
                key={organization.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => selectOrganization(organization)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1">{organization.name}</h2>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModalForEdit(organization);
                        }}
                        className="h-8 w-8 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrganization(organization.id);
                        }}
                        className="h-8 w-8 border-gray-200 dark:border-gray-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">{isAdding ? 'Add New Organization' : 'Edit Organization'}</h2>
                  {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                      {isAdding ? (
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
                      {isAdding ? (
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
                    <Button onClick={isAdding ? handleAddOrganization : handleEditOrganization} disabled={isAdding} className="rounded-md bg-blue-600 hover:bg-blue-700 text-white">
                      {isAdding ? 'Saving...' : 'Save Changes'}
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
