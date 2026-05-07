import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../api/user';
import { projectsApi } from '../../api/projects';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';

interface AddMemberFormProps {
  projectId: string;
  existingMemberIds: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

const AddMemberForm = ({ projectId, existingMemberIds, onSuccess, onCancel }: AddMemberFormProps) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['activeUsers'],
    queryFn: () => userApi.getUsers(undefined, 'ACTIVE'),
  });

  // Filter out users who are already members
  const availableUsers = (data?.users || []).filter(u => !existingMemberIds.includes(u.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }
    setSubmitting(true);
    try {
      await projectsApi.addMember(projectId, selectedUserId, role);
      toast.success('Member added successfully!');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label">Select User</label>
        {isLoading ? (
          <div className="input flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 size={14} className="animate-spin" /> Loading users...
          </div>
        ) : availableUsers.length === 0 ? (
          <p className="text-slate-400 text-sm p-3 bg-slate-800 rounded-lg border border-slate-700">
            No available users to add. All active users are already members.
          </p>
        ) : (
          <select
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
            className="input"
            required
          >
            <option value="">-- Select a member --</option>
            {availableUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="label">Role</label>
        <select
          value={role}
          onChange={e => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
          className="input"
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || availableUsers.length === 0}
          className="btn-primary flex items-center gap-2 flex-1 justify-center"
        >
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
          Add Member
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddMemberForm;
