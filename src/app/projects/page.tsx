'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Trash2, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Project } from "@/types/project";
import WorkflowsLayout from "../workflows/layout";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectTeamId, setNewProjectTeamId] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTeamId, setEditTeamId] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const openModalForAdd = () => {
    setIsAdding(true);
    setNewProjectName('');
    setNewProjectDescription('');
    setNewProjectTeamId('');
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (project: Project) => {
    setIsAdding(false);
    setEditingId(project.id);
    setEditName(project.name);
    setEditDescription(project.description || '');
    setEditTeamId(project.team_id ? project.team_id.toString() : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProject = {
      name: newProjectName,
      description: newProjectDescription,
      team_id: newProjectTeamId ? parseInt(newProjectTeamId) : undefined,
    };

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error('Failed to add project');
      }

      const addedProject = await response.json();
      setProjects([...projects, addedProject]);
      closeModal();
    } catch (err) {
      console.error(err);
      setError('Failed to add project. Please try again.');
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null || !editName.trim()) return;

    const updatedProject = {
      name: editName,
      description: editDescription,
      team_id: editTeamId ? parseInt(editTeamId) : undefined,
    };

    try {
      const response = await fetch(`/api/projects/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProject),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const updatedData = await response.json();
      setProjects(projects.map(p => p.id === editingId ? updatedData : p));
      closeModal();
    } catch (err) {
      console.error(err);
      setError('Failed to update project. Please try again.');
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete project. Please try again.');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <WorkflowsLayout>
      <div className="w-full h-full overflow-auto p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <Button onClick={openModalForAdd} className="bg-blue-600 hover:bg-blue-700 text-white">Add Project</Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading projects...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-10">No projects found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProjects.map(project => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">{project.name}</h2>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openModalForEdit(project)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteProject(project.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{project.description}</p>
                <p className="text-sm text-gray-500">Team ID: {project.team_id || 'N/A'}</p>
                <p className="text-sm text-gray-500">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>

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
                <h2 className="text-xl font-bold mb-4">{isAdding ? 'Add New Project' : 'Edit Project'}</h2>
                <form onSubmit={isAdding ? handleAddProject : handleEditProject}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input
                      value={isAdding ? newProjectName : editName}
                      onChange={(e) => isAdding ? setNewProjectName(e.target.value) : setEditName(e.target.value)}
                      placeholder="Project name"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Textarea
                      value={isAdding ? newProjectDescription : editDescription}
                      onChange={(e) => isAdding ? setNewProjectDescription(e.target.value) : setEditDescription(e.target.value)}
                      placeholder="Project description"
                      rows={3}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team ID</label>
                    <Input
                      value={isAdding ? newProjectTeamId : editTeamId}
                      onChange={(e) => isAdding ? setNewProjectTeamId(e.target.value) : setEditTeamId(e.target.value)}
                      placeholder="Team ID (optional)"
                      type="number"
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
    </WorkflowsLayout>
  );
};

export default ProjectsPage;
