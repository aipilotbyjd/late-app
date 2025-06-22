'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Trash2, Edit, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Organization } from "@/types/organization";
import WorkflowsLayout from "../workflows/layout";

const OrganizationsPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newOrganizationName, setNewOrganizationName] = useState('');
  const [newOrganizationDescription, setNewOrganizationDescription] = useState('');
  const [newOrganizationTeamId, setNewOrganizationTeamId] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTeamId, setEditTeamId] = useState('');

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://late-api.test/api/v1/organizations', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        const data = await response.json();
        setOrganizations(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load Organizations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const openModalForAdd = () => {
    setIsAdding(true);
    setNewOrganizationName('');
    setNewOrganizationDescription('');
    setNewOrganizationTeamId('');
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (organization: Organization) => {
    setIsAdding(false);
    setEditingId(organization.id);
    setEditName(organization.name);
    setEditDescription(organization.description || '');
    setEditTeamId(organization.team_id ? organization.team_id.toString() : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrganizationName.trim()) return;

    const newOrganization = {
      name: newOrganizationName,
      description: newOrganizationDescription,
      team_id: newOrganizationTeamId ? parseInt(newOrganizationTeamId) : undefined,
    };

    try {
      const response = await fetch('http://late-api.test/api/v1/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newOrganization),
      });

      if (!response.ok) {
        throw new Error('Failed to add organization');
      }

      const addedOrganization = await response.json();
      setOrganizations([...organizations, addedOrganization]);
      closeModal();
    } catch (err) {
      console.error(err);
      setError('Failed to add organization. Please try again.');
    }
  };

  const handleEditOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null || !editName.trim()) return;

    const updatedOrganization = {
      name: editName,
      description: editDescription,
      team_id: editTeamId ? parseInt(editTeamId) : undefined,
    };

    try {
      const response = await fetch(`http://late-api.test/api/v1/organizations/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedOrganization),
      });

      if (!response.ok) {
        throw new Error('Failed to update organization');
      }

      const updatedData = await response.json();
      setOrganizations(organizations.map(p => p.id === editingId ? updatedData : p));
      closeModal();
    } catch (err) {
      console.error(err);
      setError('Failed to update organization. Please try again.');
    }
  };

  const handleDeleteOrganization = async (id: number) => {
    try {
      const response = await fetch(`http://late-api.test/api/v1/organizations/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete organization: ${response.status} ${response.statusText}`);
      }

      setOrganizations(organizations.filter(p => p.id !== id));
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
            {paginatedOrganizations.map(organization => (
              <motion.div
                key={organization.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1">{organization.name}</h2>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openModalForEdit(organization)}
                        className="h-8 w-8 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteOrganization(organization.id)}
                        className="h-8 w-8 border-gray-200 dark:border-gray-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{organization.description || 'No description provided'}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span>Team: {organization.team_id || 'N/A'}</span>
                    <span>Created: {new Date(organization.createdAt).toLocaleDateString()}</span>
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
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{isAdding ? 'Create New Organization' : 'Edit Organization'}</h2>
                <form onSubmit={isAdding ? handleAddOrganization : handleEditOrganization} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Organization Name <span className="text-red-500">*</span></label>
                    <Input
                      value={isAdding ? newOrganizationName : editName}
                      onChange={(e) => isAdding ? setNewOrganizationName(e.target.value) : setEditName(e.target.value)}
                      placeholder="Enter organization name"
                      required
                      className="h-10 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                    <Textarea
                      value={isAdding ? newOrganizationDescription : editDescription}
                      onChange={(e) => isAdding ? setNewOrganizationDescription(e.target.value) : setEditDescription(e.target.value)}
                      placeholder="Describe your organization"
                      rows={3}
                      className="border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Team ID</label>
                    <Input
                      value={isAdding ? newOrganizationTeamId : editTeamId}
                      onChange={(e) => isAdding ? setNewOrganizationTeamId(e.target.value) : setEditTeamId(e.target.value)}
                      placeholder="Optional team ID"
                      type="number"
                      className="h-10 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
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
                      {isAdding ? 'Create organization' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </WorkflowsLayout>
  );
};

export default OrganizationsPage;
