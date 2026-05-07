import { TaskStatus, Priority } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
}

interface PriorityBadgeProps {
  priority: Priority;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config: Record<TaskStatus, { label: string; className: string }> = {
    TODO: { label: 'To Do', className: 'bg-slate-700 text-slate-300' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-500/20 text-blue-400' },
    REVIEW: { label: 'Review', className: 'bg-yellow-500/20 text-yellow-400' },
    DONE: { label: 'Done', className: 'bg-green-500/20 text-green-400' },
  };

  const { label, className } = config[status];

  return (
    <span className={`badge ${className}`}>{label}</span>
  );
};

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const config: Record<Priority, { label: string; className: string; dot: string }> = {
    LOW: { label: 'Low', className: 'bg-slate-700/50 text-slate-400', dot: 'bg-slate-400' },
    MEDIUM: { label: 'Medium', className: 'bg-blue-500/10 text-blue-400', dot: 'bg-blue-400' },
    HIGH: { label: 'High', className: 'bg-orange-500/10 text-orange-400', dot: 'bg-orange-400' },
    URGENT: { label: 'Urgent', className: 'bg-red-500/10 text-red-400', dot: 'bg-red-400' },
  };

  const { label, className, dot } = config[priority];

  return (
    <span className={`badge ${className} gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

interface RoleBadgeProps {
  role: 'ADMIN' | 'MEMBER';
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  return (
    <span className={`badge ${role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-300'}`}>
      {role}
    </span>
  );
};
