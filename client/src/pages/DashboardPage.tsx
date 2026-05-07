import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';
import StatsCard from '../components/dashboard/StatsCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import { SkeletonCard } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare, FolderKanban, Clock, AlertTriangle,
  TrendingUp, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  TODO: '#64748b',
  IN_PROGRESS: '#3b82f6',
  REVIEW: '#f59e0b',
  DONE: '#22c55e',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#64748b',
  MEDIUM: '#3b82f6',
  HIGH: '#f97316',
  URGENT: '#ef4444',
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [isGlobal, setIsGlobal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats', isGlobal],
    queryFn: () => dashboardApi.getStats(isGlobal),
  });

  const stats = data?.stats;

  const statusData = stats?.tasksByStatus?.map(s => ({
    name: s.status.replace('_', ' '),
    value: s._count,
    color: STATUS_COLORS[s.status],
  })) || [];

  const priorityData = stats?.tasksByPriority?.map(p => ({
    name: p.priority,
    value: p._count,
    fill: PRIORITY_COLORS[p.priority],
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {isGlobal ? 'Overview of all projects across the entire system.' : "Here's what's happening with your projects today."}
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 w-fit">
            <button
              onClick={() => setIsGlobal(false)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !isGlobal ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              My Stats
            </button>
            <button
              onClick={() => setIsGlobal(true)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isGlobal ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              Global View
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatsCard
              title="Total Projects"
              value={stats?.totalProjects || 0}
              icon={FolderKanban}
              color="text-indigo-400"
              bgColor="bg-indigo-500/10"
              index={0}
            />
            <StatsCard
              title="Total Tasks"
              value={stats?.totalTasks || 0}
              icon={CheckSquare}
              color="text-blue-400"
              bgColor="bg-blue-500/10"
              index={1}
            />
            <StatsCard
              title="Completed"
              value={stats?.completedTasks || 0}
              icon={TrendingUp}
              color="text-green-400"
              bgColor="bg-green-500/10"
              change={`${stats?.completionRate || 0}%`}
              index={2}
            />
            <StatsCard
              title="Overdue"
              value={stats?.overdueTasks || 0}
              icon={AlertTriangle}
              color="text-red-400"
              bgColor="bg-red-500/10"
              index={3}
            />
          </>
        )}
      </div>

      {/* Progress Bar */}
      {!isLoading && stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold">Overall Completion</h3>
              <p className="text-slate-400 text-sm">{stats.completedTasks} of {stats.totalTasks} tasks completed</p>
            </div>
            <span className="text-2xl font-bold text-white">{stats.completionRate}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.completionRate}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            />
          </div>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-400" />
            Tasks by Status
          </h3>
          {isLoading ? (
            <div className="skeleton h-48 rounded-lg" />
          ) : statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#F1F5F9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data yet</div>
          )}
        </motion.div>

        {/* Priority Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-400" />
            Tasks by Priority
          </h3>
          {isLoading ? (
            <div className="skeleton h-48 rounded-lg" />
          ) : priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data yet</div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-5"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Clock size={18} className="text-slate-400" />
          Recent Activity
        </h3>
        {isLoading ? (
          <div className="space-y-2">
            {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
          </div>
        ) : (
          <ActivityFeed tasks={stats?.recentActivities || []} />
        )}
      </motion.div>
    </div>
  );
};

export default DashboardPage;
