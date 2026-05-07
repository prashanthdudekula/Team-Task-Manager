import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Project } from '../../types';
import { projectsApi } from '../../api/projects';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ProjectFormProps {
  project?: Project;
  onSuccess: (project: Project) => void;
  onCancel: () => void;
}

const ProjectForm = ({ project, onSuccess, onCancel }: ProjectFormProps) => {
  const isEditing = !!project;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        const res = await projectsApi.update(project!.id, data);
        toast.success('Project updated');
        onSuccess(res.project);
      } else {
        const res = await projectsApi.create(data);
        toast.success('Project created');
        onSuccess(res.project);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save project');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Project Name *</label>
        <input {...register('title')} className="input" placeholder="e.g. Website Redesign" />
        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          {...register('description')}
          className="input min-h-[100px] resize-none"
          placeholder="What is this project about?"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {isSubmitting && <Loader2 size={14} className="animate-spin" />}
          {isEditing ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
