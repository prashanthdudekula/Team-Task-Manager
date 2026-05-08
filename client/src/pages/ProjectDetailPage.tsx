import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { Task, TaskStatus } from '../types';
import KanbanBoard from '../components/kanban/KanbanBoard';
import Modal from '../components/common/Modal';
import TaskForm from '../components/forms/TaskForm';
import AddMemberForm from '../components/forms/AddMemberForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { SkeletonCard } from '../components/common/LoadingSpinner';
import { ArrowLeft, Plus, Users, LayoutGrid, List, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [taskModal, setTaskModal] = useState<{ open: boolean; status?: TaskStatus; task?: Task }>({ open: false });
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const { user } = useAuth();

  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.getByProject(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (tasksData?.tasks) {
      setTasks(tasksData.tasks);
    }
  }, [tasksData]);

  const project = projectData?.project;
  const members = project?.members || [];
  
  const isProjectAdmin = members.some(m => m.userId === user?.id && m.role === 'ADMIN');
  const isGlobalAdmin = user?.role === 'ADMIN';
  const canManage = isProjectAdmin || isGlobalAdmin;

  const handleDeleteTask = async () => {
    if (!deleteTask) return;
    setDeleting(true);
    try {
      await tasksApi.delete(deleteTask.id);
      setTasks(prev => prev.filter(t => t.id !== deleteTask.id));
      toast.success('Task deleted');
      setDeleteTask(null);
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  if (projectLoading) return (
    <div className="grid grid-cols-4 gap-4 mt-6">
      {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  if (!project) return (
    <div className="text-center py-20">
      <p className="text-slate-400">Project not found</p>
      <Link to="/projects" className="text-indigo-400 hover:underline mt-2 inline-block">Go back</Link>
    </div>
  );

  const progress = (() => {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100);
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to="/projects" className="text-slate-400 hover:text-white transition-colors mt-1">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{project.title}</h1>
            {project.description && <p className="text-slate-400 text-sm mt-1">{project.description}</p>}
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Users size={13} />
                {members.length} member{members.length !== 1 ? 's' : ''}
              </span>
              {canManage && (
                <button
                  onClick={() => setAddMemberModal(true)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <UserPlus size={13} /> Add Member
                </button>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-24 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span>{progress}% complete</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded transition-all ${view === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded transition-all ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <List size={15} />
            </button>
          </div>
          {canManage && (
            <button
              onClick={() => setTaskModal({ open: true })}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={15} /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Kanban / List View */}
      {tasksLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          onTasksChange={setTasks}
          onCreateTask={(status) => setTaskModal({ open: true, status })}
          onEditTask={(task) => setTaskModal({ open: true, task })}
          onDeleteTask={setDeleteTask}
        />
      ) : (
        /* List View */
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                {['Task', 'Status', 'Priority', 'Assignee', 'Due Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">No tasks yet</td>
                </tr>
              ) : tasks.map(task => (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-700/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">{task.title}</p>
                    {task.description && <p className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{task.description}</p>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-600/30 rounded-full flex items-center justify-center text-indigo-400 text-xs font-bold">
                        {task.assignee?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-slate-300 text-xs">{task.assignee?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Modal */}
      <Modal
        isOpen={taskModal.open}
        onClose={() => setTaskModal({ open: false })}
        title={taskModal.task ? 'Edit Task' : 'New Task'}
      >
        <TaskForm
          projectId={id!}
          members={members}
          task={taskModal.task}
          defaultStatus={taskModal.status}
          onSuccess={(newTask) => {
            if (taskModal.task) {
              setTasks(prev => prev.map(t => t.id === newTask.id ? newTask : t));
            } else {
              setTasks(prev => [newTask, ...prev]);
            }
            setTaskModal({ open: false });
          }}
          onCancel={() => setTaskModal({ open: false })}
        />
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={addMemberModal}
        onClose={() => setAddMemberModal(false)}
        title="Add Member to Project"
      >
        <AddMemberForm
          projectId={id!}
          existingMemberIds={members.map(m => m.userId)}
          onSuccess={() => {
            setAddMemberModal(false);
            qc.invalidateQueries({ queryKey: ['project', id] });
          }}
          onCancel={() => setAddMemberModal(false)}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTask}
        title="Delete Task"
        message={`Delete "${deleteTask?.title}"? This cannot be undone.`}
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteTask(null)}
        loading={deleting}
      />
    </div>
  );
};

export default ProjectDetailPage;
