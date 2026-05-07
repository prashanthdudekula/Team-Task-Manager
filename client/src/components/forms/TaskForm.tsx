import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Task, TaskStatus, ProjectMember } from '../../types';
import { tasksApi } from '../../api/tasks';
import { commentsApi } from '../../api/comments';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
  assignedTo: z.string().min(1, 'Assignee is required'),
});

type FormData = z.infer<typeof schema>;

interface TaskFormProps {
  projectId: string;
  members: ProjectMember[];
  task?: Task;
  defaultStatus?: TaskStatus;
  onSuccess: (task: Task) => void;
  onCancel: () => void;
}

const TaskForm = ({ projectId, members, task, defaultStatus: _defaultStatus, onSuccess, onCancel }: TaskFormProps) => {
  const isEditing = !!task;
  const qc = useQueryClient();
  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'MEDIUM',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assignedTo: task?.assignedTo || '',
    },
  });

  const { data: commentsData } = useQuery({
    queryKey: ['comments', task?.id],
    queryFn: () => commentsApi.getByTask(task!.id),
    enabled: isEditing,
  });
  const comments = commentsData?.comments || [];

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        const res = await tasksApi.update(task!.id, {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        });
        toast.success('Task updated');
        onSuccess(res.task);
      } else {
        const res = await tasksApi.create({
          ...data,
          projectId,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        });
        toast.success('Task created');
        onSuccess(res.task);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save task');
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !task) return;
    setAddingComment(true);
    try {
      await commentsApi.create({ taskId: task.id, message: comment });
      setComment('');
      qc.invalidateQueries({ queryKey: ['comments', task.id] });
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input {...register('title')} className="input" placeholder="Task title" />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            {...register('description')}
            className="input min-h-[80px] resize-none"
            placeholder="Describe this task..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Priority *</label>
            <select {...register('priority')} className="input">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="label">Due Date</label>
            <input {...register('dueDate')} type="date" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Assign To *</label>
          <select {...register('assignedTo')} className="input">
            <option value="">Select member</option>
            {members.map(m => (
              <option key={m.userId} value={m.userId}>{m.user.name}</option>
            ))}
          </select>
          {errors.assignedTo && <p className="text-red-400 text-xs mt-1">{errors.assignedTo.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {isEditing ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>

      {isEditing && (
        <div className="pt-4 border-t border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Comments</h3>
          
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-2">No comments yet</p>
            ) : (
              comments.map((c: any) => (
                <div key={c.id} className="bg-slate-800/50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-slate-200">{c.user?.name}</span>
                    <span className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-400">{c.message}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              placeholder="Write a comment..." 
              className="input flex-1"
            />
            <button 
              type="button" 
              onClick={handleAddComment}
              disabled={!comment.trim() || addingComment}
              className="btn-primary px-3 py-2 flex items-center justify-center disabled:opacity-50"
            >
              {addingComment ? <Loader2 size={14} className="animate-spin" /> : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskForm;
