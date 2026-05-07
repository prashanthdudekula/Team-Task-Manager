import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '../../types';
import { PriorityBadge } from '../common/Badge';
import { Calendar, MessageSquare, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { tasksApi } from '../../api/tasks';
import { toast } from 'sonner';

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'TODO', label: 'To Do', color: 'border-slate-500' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-500' },
  { id: 'REVIEW', label: 'Review', color: 'border-yellow-500' },
  { id: 'DONE', label: 'Done', color: 'border-green-500' },
];

interface KanbanBoardProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onCreateTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

const formatDate = (date?: string) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isOverdue = (date?: string, status?: TaskStatus) => {
  if (!date || status === 'DONE') return false;
  return new Date(date) < new Date();
};

const KanbanBoard = ({ tasks, onTasksChange, onCreateTask, onEditTask, onDeleteTask }: KanbanBoardProps) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const getColumnTasks = (status: TaskStatus) =>
    tasks.filter(t => t.status === status);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as TaskStatus;
    const updatedTasks = tasks.map(t =>
      t.id === draggableId ? { ...t, status: newStatus } : t
    );
    onTasksChange(updatedTasks);

    try {
      await tasksApi.update(draggableId, { status: newStatus });
      toast.success('Task status updated');
    } catch {
      onTasksChange(tasks);
      toast.error('Failed to update task status');
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[600px]">
        {COLUMNS.map(col => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div key={col.id} className="flex flex-col">
              {/* Column Header */}
              <div className={`flex items-center justify-between px-3 py-2.5 mb-3 rounded-lg bg-slate-800/50 border-l-2 ${col.color}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">{col.label}</span>
                  <span className="text-xs bg-slate-700 text-slate-400 rounded-full px-2 py-0.5 font-medium">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => onCreateTask(col.id)}
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Droppable */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-xl transition-colors min-h-[200px] space-y-3 p-1 ${
                      snapshot.isDraggingOver ? 'bg-indigo-600/5 ring-1 ring-indigo-500/30' : ''
                    }`}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`card p-3.5 cursor-grab active:cursor-grabbing transition-all duration-200 ${
                              snapshot.isDragging ? 'shadow-2xl shadow-indigo-600/20 rotate-1 scale-105' : 'hover:border-slate-600'
                            }`}
                          >
                            {/* Task Menu */}
                            <div className="flex items-start justify-between mb-2 gap-2">
                              <p className="text-sm font-medium text-slate-100 leading-snug flex-1">
                                {task.title}
                              </p>
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenu(activeMenu === task.id ? null : task.id);
                                  }}
                                  className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                                >
                                  <MoreVertical size={14} />
                                </button>
                                {activeMenu === task.id && (
                                  <div className="absolute right-0 top-6 w-32 card shadow-xl z-10 py-1">
                                    <button
                                      onClick={() => { onEditTask(task); setActiveMenu(null); }}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                                    >
                                      <Pencil size={12} /> Edit
                                    </button>
                                    <button
                                      onClick={() => { onDeleteTask(task); setActiveMenu(null); }}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-slate-700 transition-colors"
                                    >
                                      <Trash2 size={12} /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-3">
                              <PriorityBadge priority={task.priority} />
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <div className="w-5 h-5 bg-indigo-600/30 rounded-full flex items-center justify-center">
                                    <span className="text-indigo-400 font-bold" style={{ fontSize: 8 }}>
                                      {task.assignee?.name?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                {task.comments && task.comments.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <MessageSquare size={10} />
                                    {task.comments.length}
                                  </span>
                                )}
                              </div>
                              {task.dueDate && (
                                <span className={`flex items-center gap-1 ${
                                  isOverdue(task.dueDate, task.status) ? 'text-red-400' : 'text-slate-500'
                                }`}>
                                  <Calendar size={10} />
                                  {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div
                        onClick={() => onCreateTask(col.id)}
                        className="h-24 border-2 border-dashed border-slate-700/50 rounded-xl flex items-center justify-center cursor-pointer hover:border-slate-600 transition-colors"
                      >
                        <span className="text-xs text-slate-500">+ Add task</span>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
