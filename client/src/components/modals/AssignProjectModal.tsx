import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../../api/projects';
import { toast } from 'sonner';
import { FolderPlus, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';

interface AssignProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  existingProjectIds: string[];
  onSuccess: () => void;
}

const AssignProjectModal = ({ 
  isOpen, 
  onClose, 
  userId, 
  userName, 
  existingProjectIds,
  onSuccess 
}: AssignProjectModalProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['all-projects-admin'],
    queryFn: () => projectsApi.getAll(),
    enabled: isOpen,
  });

  const availableProjects = (data?.projects || []).filter(
    p => !existingProjectIds.includes(p.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }

    setSubmitting(true);
    try {
      await projectsApi.addMember(selectedProjectId, userId, role);
      toast.success(`Successfully assigned ${userName} to project`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to assign project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign ${userName} to Project`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Select Project</label>
          {isLoading ? (
            <div className="input flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 size={14} className="animate-spin" /> Loading projects...
            </div>
          ) : availableProjects.length === 0 ? (
            <p className="text-slate-400 text-sm p-3 bg-slate-800 rounded-lg border border-slate-700">
              No projects available to assign. User is already in all projects.
            </p>
          ) : (
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="input"
              required
            >
              <option value="">-- Select a project --</option>
              {availableProjects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="label">Project Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
            className="input"
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          <p className="text-[10px] text-slate-500 mt-1">
            * Project admins can manage tasks and members within the project.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || availableProjects.length === 0}
            className="btn-primary flex items-center gap-2 flex-1 justify-center"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <FolderPlus size={15} />}
            Assign Project
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignProjectModal;
