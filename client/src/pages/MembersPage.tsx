import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import { userApi } from '../api/user';
import { useAuth } from '../context/AuthContext';
import { Users, FolderKanban, Mail, Check, X, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { RoleBadge } from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { SkeletonCard } from '../components/common/LoadingSpinner';
import { toast } from 'sonner';
import AssignProjectModal from '../components/modals/AssignProjectModal';

const MembersPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';
  const [assignModal, setAssignModal] = useState<{ open: boolean; userId: string; userName: string; existingProjects: string[] }>({ 
    open: false, userId: '', userName: '', existingProjects: [] 
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(),
  });

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingUsers'],
    queryFn: () => userApi.getUsers(undefined, 'PENDING'),
    enabled: isAdmin,
  });

  const { data: allUsersData } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => userApi.getUsers(),
    enabled: isAdmin,
  });

  const handleApprove = async (id: string) => {
    try {
      await userApi.approve(id);
      toast.success('User approved');
      qc.invalidateQueries({ queryKey: ['pendingUsers'] });
      qc.invalidateQueries({ queryKey: ['allUsers'] });
    } catch {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await userApi.reject(id);
      toast.success('User rejected');
      qc.invalidateQueries({ queryKey: ['pendingUsers'] });
      qc.invalidateQueries({ queryKey: ['allUsers'] });
    } catch {
      toast.error('Failed to reject user');
    }
  };

  const handleUpdateUser = async (id: string, data: { role?: string, status?: string }) => {
    try {
      await userApi.updateUser(id, data);
      toast.success('User updated');
      qc.invalidateQueries({ queryKey: ['allUsers'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update user');
    }
  };

  const projects = projectsData?.projects || [];
  const pendingUsers = pendingData?.users || [];
  const allUsers = allUsersData?.users || [];

  const membersMap = new Map<string, { user: any; projects: { id: string; title: string; role: string }[] }>();
  
  if (isAdmin) {
    allUsers.forEach(u => {
      membersMap.set(u.id, { user: u, projects: [] });
    });
  }

  projects.forEach(project => {
    project.members.forEach(m => {
      if (!membersMap.has(m.userId)) {
        membersMap.set(m.userId, { user: m.user, projects: [] });
      }
      membersMap.get(m.userId)!.projects.push({ id: project.id, title: project.title, role: m.role });
    });
  });

  const members = Array.from(membersMap.values());
  const isLoading = projectsLoading || (isAdmin && pendingLoading);

  return (
    <div className="space-y-8">
      {isAdmin && pendingUsers.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock size={20} className="text-amber-400" />
              Pending Approvals
            </h2>
            <p className="text-slate-400 text-sm mt-1">Users waiting for admin verification</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingUsers.map(u => (
              <div key={u.id} className="card p-5 border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 text-lg font-bold">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{u.name}</p>
                    <p className="text-slate-400 text-xs truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(u.id)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
                    <Check size={16} /> Approve
                  </button>
                  <button onClick={() => handleReject(u.id)} className="flex-1 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-slate-400 text-sm mt-1">{members.length} member{members.length !== 1 ? 's' : ''} across all projects</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No team members yet"
            description="Create a project and add members to get started."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(({ user: mUser, projects: memberProjects }, i) => (
              <motion.div
                key={mUser.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 hover:border-slate-600/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-indigo-600/20">
                      {mUser.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold truncate">{mUser.name}</p>
                        <RoleBadge role={mUser.role} />
                      </div>
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5 truncate">
                        <Mail size={11} />
                        {mUser.email}
                      </p>
                    </div>
                  </div>
                  {isAdmin && mUser.id !== user?.id && (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setAssignModal({ 
                          open: true, 
                          userId: mUser.id, 
                          userName: mUser.name, 
                          existingProjects: memberProjects.map(p => p.id) 
                        })}
                        className="text-[10px] px-2 py-1 bg-indigo-600/10 text-indigo-400 border border-indigo-400/20 rounded hover:bg-indigo-600/20 transition-all uppercase font-bold"
                      >
                        Assign Project
                      </button>
                      <button
                        onClick={() => handleUpdateUser(mUser.id, { role: mUser.role === 'ADMIN' ? 'MEMBER' : 'ADMIN' })}
                        className="text-[10px] px-2 py-1 bg-slate-800 text-indigo-400 border border-indigo-400/20 rounded hover:bg-indigo-400/10 transition-all uppercase font-bold"
                      >
                        {mUser.role === 'ADMIN' ? 'Demote' : 'Promote'}
                      </button>
                      <button
                        onClick={() => handleUpdateUser(mUser.id, { status: mUser.status === 'ACTIVE' ? 'REJECTED' : 'ACTIVE' })}
                        className={`text-[10px] px-2 py-1 bg-slate-800 border rounded transition-all uppercase font-bold ${
                          mUser.status === 'ACTIVE' 
                            ? 'text-red-400 border-red-400/20 hover:bg-red-400/10' 
                            : 'text-green-400 border-green-400/20 hover:bg-green-400/10'
                        }`}
                      >
                        {mUser.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Projects</p>
                  {memberProjects.slice(0, 3).map((proj, j) => (
                    <div key={j} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-800/50">
                      <span className="flex items-center gap-1.5 text-xs text-slate-300 truncate">
                        <FolderKanban size={11} className="text-indigo-400 flex-shrink-0" />
                        {proj.title}
                      </span>
                      <RoleBadge role={proj.role as 'ADMIN' | 'MEMBER'} />
                    </div>
                  ))}
                  {memberProjects.length > 3 && (
                    <p className="text-xs text-slate-500 text-center pt-1">+{memberProjects.length - 3} more</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <AssignProjectModal
          isOpen={assignModal.open}
          onClose={() => setAssignModal(prev => ({ ...prev, open: false }))}
          userId={assignModal.userId}
          userName={assignModal.userName}
          existingProjectIds={assignModal.existingProjects}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['projects'] });
            qc.invalidateQueries({ queryKey: ['allUsers'] });
          }}
        />
      )}
    </div>
  );
};

export default MembersPage;
