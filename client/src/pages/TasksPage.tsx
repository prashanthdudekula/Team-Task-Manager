import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { Task, TaskStatus, Priority } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { CheckSquare, Filter, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { SkeletonRow } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const TasksPage = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [myTasksOnly, setMyTasksOnly] = useState(false);

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(),
  });

  const projects = projectsData?.projects || [];

  const { data: allTasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['all-tasks', projects.map(p => p.id)],
    queryFn: async () => {
      const results = await Promise.all(projects.map(p => tasksApi.getByProject(p.id)));
      return results.flatMap(r => r.tasks);
    },
    enabled: projects.length > 0,
  });

  const isLoading = projectsLoading || (projects.length > 0 && tasksLoading);

  const allTasks: Task[] = allTasksData || [];

  const filtered = allTasks.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (myTasksOnly && t.assignedTo !== user?.id) return false;
    return true;
  });

  const getProjectTitle = (projectId: string) =>
    projects.find(p => p.id === projectId)?.title || 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Tasks</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Filter size={15} />
            <span>Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="input !w-auto text-xs py-1.5"
          >
            <option value="ALL">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as any)}
            className="input !w-auto text-xs py-1.5"
          >
            <option value="ALL">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <button
            onClick={() => setMyTasksOnly(!myTasksOnly)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              myTasksOnly
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'
            }`}
          >
            <User size={12} />
            My Tasks
          </button>

          {(statusFilter !== 'ALL' || priorityFilter !== 'ALL' || myTasksOnly) && (
            <button
              onClick={() => { setStatusFilter('ALL'); setPriorityFilter('ALL'); setMyTasksOnly(false); }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Tasks Table */}
      {isLoading ? (
        <div className="card p-4 space-y-1">
          {Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="Try adjusting your filters or create tasks from a project."
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                {['Task', 'Project', 'Status', 'Priority', 'Assignee', 'Due'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.map((task, i) => (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-700/20 transition-colors"
                >
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium text-slate-200 truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-slate-500 text-xs mt-0.5 truncate">{task.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                      {getProjectTitle(task.projectId)}
                    </span>
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
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {task.dueDate ? (
                      <span className={new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-400' : ''}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    ) : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
