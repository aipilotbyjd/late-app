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

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProject = {
      name: newProjectName,
      description: newProjectDescription,
      team_id: newProjectTeamId,
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
      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectTeamId('');
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      setError('Failed to add project. Please try again.');
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

      setProjects(projects.filter(project => project.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete project. Please try again.');
    }
  };

  const handleEditProject = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const updatedProject = {
      name: editName,
      description: editDescription,
      team_id: editTeamId,
    };

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProject),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const updated = await response.json();
      setProjects(projects.map(project =>
        project.id === id ? updated : project
      ));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError('Failed to update project. Please try again.');
    }
  };

  const startEditing = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
    setEditDescription(project.description);
    setEditTeamId(project.team_id);
  };

  return (
    <WorkflowsLayout>
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

        {/* Add Project Button */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
            New Project
          </Button>
        </motion.div>

        {/* Add Project Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800"
            >
              <h2 className="mb-4 text-lg font-medium">Add New Project</h2>
              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <Input
                    placeholder="Project Name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Project Description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="h-24"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Team ID"
                    value={newProjectTeamId}
                    onChange={(e) => setNewProjectTeamId(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Project</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar */}
        <div className="mb-6 flex items-center space-x-2 rounded-lg border bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            className="border-0"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-8 text-center">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-lg border bg-white p-6 text-center shadow-sm dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No projects match your search.' : 'No projects available. Add one to get started.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800"
              >
                {editingId === project.id ? (
                  <form onSubmit={(e) => handleEditProject(e, project.id)} className="space-y-3">
                    <div>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="h-20"
                      />
                    </div>
                    <div>
                      <Input
                        value={editTeamId}
                        onChange={(e) => setEditTeamId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save</Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Team ID: {project.team_id}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(project)}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{project.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {filteredProjects.length > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-md border bg-white p-2 text-sm dark:bg-gray-800"
              >
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </WorkflowsLayout>
  );
};

export default ProjectsPage;
