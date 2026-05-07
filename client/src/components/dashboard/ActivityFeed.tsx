import React from 'react';
import { Task } from '../../types';
import { GitBranch } from 'lucide-react';
import { StatusBadge } from '../common/Badge';

interface ActivityFeedProps {
  tasks: Task[];
}

const getTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
};

const ActivityFeed = ({ tasks }: ActivityFeedProps) => {
  if (!tasks.length) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.slice(0, 8).map((task, i) => (
        <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
          <div className="w-8 h-8 bg-indigo-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <GitBranch size={14} className="text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 font-medium truncate">{task.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={task.status} />
              <span className="text-xs text-slate-500">{getTimeAgo(task.updatedAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
