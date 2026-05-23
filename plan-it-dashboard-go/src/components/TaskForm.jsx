
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Clock, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'completed']).default('todo'),
  dueDate: z.date().optional().nullable(),
  dueTime: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  category: z.string().optional(),
  color: z.string().optional(),
  projectId: z.string().optional(),
});

const CATEGORIES = ['Study', 'Work', 'Health', 'Finance', 'Birthday', 'Event', 'Personal', 'Shopping', 'Other'];

const CATEGORY_COLOR_MAP = {
  'Study': 'banana',
  'Work': 'graphite',
  'Health': 'sage',
  'Finance': 'blueberry',
  'Birthday': 'flamingo',
  'Event': 'lavender',
  'Personal': 'peacock',
  'Shopping': 'grape',
  'Other': 'graphite'
};

const TaskForm = ({ onSubmit, initialData, closeDialog, projects = [] }) => {
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, watch, setValue } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      status: initialData?.status || 'todo',
      dueDate: initialData?.dueDate || null,
      dueTime: initialData?.dueTime || '',
      progress: initialData?.progress || 0,
      category: initialData?.category || '',
      color: initialData?.color || '',
      projectId: initialData?.projectId || '',
    },
  });
  
  const [customTimeInput, setCustomTimeInput] = useState(false);
  const [hours, setHours] = useState('12');
  const [minutes, setMinutes] = useState('00');
  const [period, setPeriod] = useState('AM');
  
  const currentCategory = watch('category');
  
  useEffect(() => {
    if (currentCategory && CATEGORY_COLOR_MAP[currentCategory]) {
      setValue('color', CATEGORY_COLOR_MAP[currentCategory]);
    }
  }, [currentCategory, setValue]);
  
  const handleFormSubmit = (data) => {
    if (customTimeInput && data.dueDate) {
      data.dueTime = `${hours}:${minutes} ${period}`;
    }
    
    onSubmit({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate || undefined,
      dueTime: data.dueTime,
      progress: data.progress,
      category: data.category || undefined,
      color: data.color,
      projectId: data.projectId && data.projectId !== 'none' ? data.projectId : undefined,
    });
    
    closeDialog?.();
  };
  
  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(1, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title *</Label>
        <Input id="title" placeholder="Task title" {...register('title')} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" placeholder="Task description" {...register('description')} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {projects.length > 0 && (
        <div className="space-y-2">
          <Label>Project (optional)</Label>
          <Controller
            control={control}
            name="projectId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Due Date (optional)</Label>
          <Controller
            control={control}
            name="dueDate"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? (
                      <div className="flex items-center">
                        <span>{format(field.value, 'PPP')}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-2"
                          onClick={(e) => { e.stopPropagation(); field.onChange(null); }}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Due Time (optional)</Label>
          <div className="flex items-center gap-2">
            {customTimeInput ? (
              <div className="flex items-center gap-1 w-full">
                <Select defaultValue={hours} onValueChange={setHours}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {hourOptions.map(hour => <SelectItem key={hour} value={hour}>{hour}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span>:</span>
                <Select defaultValue={minutes} onValueChange={setMinutes}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-56 overflow-y-auto">
                    {minuteOptions.map(minute => <SelectItem key={minute} value={minute}>{minute}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select defaultValue={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-6 w-6"
                  onClick={() => { setCustomTimeInput(false); setValue('dueTime', ''); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" className="w-full flex items-center justify-start"
                onClick={() => {
                  setCustomTimeInput(true);
                  const now = new Date();
                  setHours(String(now.getHours() % 12 || 12));
                  setMinutes(String(now.getMinutes()).padStart(2, '0'));
                  setPeriod(now.getHours() >= 12 ? 'PM' : 'AM');
                }}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Set time</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        {closeDialog && (
          <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 transition-opacity"
        >
          {initialData?.id ? 'Update Task' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
