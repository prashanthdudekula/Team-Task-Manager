import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import { Project } from '../types';
import { Plus, FolderKanban, Users, CheckSquare, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/common/Modal';
import ProjectForm from '../components/forms/ProjectForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { SkeletonCard } from '../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const ProjectsPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(),
  });

  const projects = data?.projects || [];

  const getProgress = (project: Project) => {
    const tasks = project.tasks || [];
    if (!tasks.length) return 0;
    const done = tasks.filter(t => t.status === 'DONE').length;
    return Math.round((done / tasks.length) * 100);
  };

  const handleDelete = async () => {
    if (!deleteProject) return;
    setDeleting(true);
    try {
      await projectsApi.delete(deleteProject.id);
      toast.success('Project deleted');
      qc.invalidateQueries({ queryKey: ['projects'] });
      setDeleteProject(null);
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Project
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start organizing tasks and collaborating with your team."
          action={
            <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Create Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const progress = getProgress(project);
            const isAdmin = project.members.some(m => m.userId === user?.id && m.role === 'ADMIN');
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 hover:border-slate-600/60 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                    <FolderKanban size={18} className="text-indigo-400" />
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditProject(project)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteProject(project)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-white font-semibold text-base mb-1 truncate">{project.title}</h3>
                {project.description && (
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span>Progress</span>
                    <span className="font-medium text-slate-300">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {project.members.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckSquare size={12} />
                      {project.tasks?.length || 0}
                    </span>
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                  >
                    View <ArrowRight size={12} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Project">
        <ProjectForm
          onSuccess={(p) => {
            qc.invalidateQueries({ queryKey: ['projects'] });
            setCreateOpen(false);
          }}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editProject} onClose={() => setEditProject(null)} title="Edit Project">
        {editProject && (
          <ProjectForm
            project={editProject}
            onSuccess={() => {
              qc.invalidateQueries({ queryKey: ['projects'] });
              setEditProject(null);
            }}
            onCancel={() => setEditProject(null)}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteProject?.title}"? This will permanently delete all tasks and data associated with this project.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteProject(null)}
        loading={deleting}
      />
    </div>
  );
};

export default ProjectsPage;
