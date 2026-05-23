
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Pencil, Trash2 } from 'lucide-react';
import { format, isBefore } from 'date-fns';

// Color mapping for task colors
const COLOR_MAP = {
  banana: 'bg-yellow-300 border-yellow-400 text-yellow-800',
  basil: 'bg-green-600 border-green-700 text-white',
  sage: 'bg-green-400 border-green-500 text-green-900',
  peacock: 'bg-teal-500 border-teal-600 text-white',
  blueberry: 'bg-blue-500 border-blue-600 text-white',
  lavender: 'bg-purple-300 border-purple-400 text-purple-900',
  grape: 'bg-purple-700 border-purple-800 text-white',
  flamingo: 'bg-pink-500 border-pink-600 text-white',
  graphite: 'bg-gray-500 border-gray-600 text-white',
};

// Category to color mapping
const CATEGORY_COLOR_MAP = {
  'Study': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Work': 'bg-gray-100 text-gray-800 border-gray-200',
  'Health': 'bg-green-100 text-green-800 border-green-200',
  'Finance': 'bg-blue-100 text-blue-800 border-blue-200',
  'Birthday': 'bg-red-100 text-red-800 border-red-200',
  'Event': 'bg-purple-100 text-purple-800 border-purple-200',
  'Personal': 'bg-teal-100 text-teal-800 border-teal-200',
  'Shopping': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Other': 'bg-gray-100 text-gray-800 border-gray-200',
};

const CATEGORY_BACKGROUND_MAP = {
  'Study': 'bg-yellow-50/30 dark:bg-yellow-900/10',
  'Work': 'bg-gray-50/30 dark:bg-gray-900/10',
  'Health': 'bg-green-50/30 dark:bg-green-900/10',
  'Finance': 'bg-blue-50/30 dark:bg-blue-900/10',
  'Birthday': 'bg-red-50/30 dark:bg-red-900/10',
  'Event': 'bg-purple-50/30 dark:bg-purple-900/10',
  'Personal': 'bg-teal-50/30 dark:bg-teal-900/10',
  'Shopping': 'bg-indigo-50/30 dark:bg-indigo-900/10',
  'Other': 'bg-gray-50/30 dark:bg-gray-900/10',
};

const CATEGORY_BORDER_MAP = {
  'Study': 'border-l-4 border-l-yellow-500',
  'Work': 'border-l-4 border-l-gray-500',
  'Health': 'border-l-4 border-l-green-500',
  'Finance': 'border-l-4 border-l-blue-500',
  'Birthday': 'border-l-4 border-l-red-500',
  'Event': 'border-l-4 border-l-purple-500',
  'Personal': 'border-l-4 border-l-teal-500',
  'Shopping': 'border-l-4 border-l-indigo-500',
  'Other': 'border-l-4 border-l-gray-500',
};

const STATUS_BADGE_MAP = {
  'todo': 'bg-slate-500/10 text-slate-600 border-slate-200',
  'in_progress': 'bg-amber-500/10 text-amber-600 border-amber-200',
  'completed': 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
};

const STATUS_LABEL_MAP = {
  'todo': 'To Do',
  'in_progress': 'In Progress',
  'completed': 'Completed',
};

const TaskCard = ({ task, onStatusChange, onEdit, onDelete, onProgressUpdate }) => {
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [progress, setProgress] = useState(task.progress || 0);
  
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-200 dark:border-red-800';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-200 dark:border-amber-800';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-200 dark:border-green-800';
      default: return '';
    }
  };
  
  const handleProgressChange = (e) => {
    setProgress(parseInt(e.target.value));
  };
  
  const saveProgress = () => {
    onProgressUpdate(task.id, progress);
    setIsUpdatingProgress(false);
  };
  
  const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !task.completed;
  
  const formatDueDate = () => {
    if (!task.dueDate) return '';
    const date = format(new Date(task.dueDate), 'MMM d');
    const time = task.dueTime ? `, ${task.dueTime}` : '';
    return `${date}${time}`;
  };

  const getTaskColorClass = () => {
    if (isOverdue) return 'border-l-4 border-l-red-600';
    if (task.category) return CATEGORY_BORDER_MAP[task.category] || '';
    return '';
  };
  
  const getTaskBackgroundClass = () => {
    if (task.completed) return 'bg-muted/40';
    if (isOverdue) return 'bg-red-50 dark:bg-red-900/10';
    if (task.category) return CATEGORY_BACKGROUND_MAP[task.category] || '';
    return '';
  };
  
  const taskStatus = task.status || (task.completed ? 'completed' : 'todo');

  return (
    <Card
      className={`${getTaskBackgroundClass()} ${getTaskColorClass()}`}
      aria-label={`Task: ${task.title} - ${STATUS_LABEL_MAP[taskStatus]}`}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) => onStatusChange(task.id, Boolean(checked))}
              className="mt-1 cursor-pointer"
            />
            <div>
              <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-sm mt-1 ${task.completed ? 'text-muted-foreground/80' : 'text-muted-foreground'}`}>
                  {task.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge variant="outline" className={`rounded-md text-xs ${STATUS_BADGE_MAP[taskStatus]}`}>
            {STATUS_LABEL_MAP[taskStatus]}
          </Badge>

          {task.category && (
            <Badge variant="outline" className={`rounded-md text-xs ${CATEGORY_COLOR_MAP[task.category] || 'bg-secondary/50'}`}>
              {task.category}
            </Badge>
          )}
          
          <Badge className={`rounded-md ${getPriorityColor()} text-xs`}>
            {task.priority}
          </Badge>
          
          {task.dueDate && (
            <Badge
              variant="outline"
              className={`flex items-center gap-1 text-xs rounded-md ${
                isOverdue ? 'bg-red-500/10 text-red-500 border-red-200' : 'bg-blue-500/10 text-blue-500 border-blue-200 dark:border-blue-800'
              }`}
            >
              <Clock className="h-3 w-3" />
              {formatDueDate()}
            </Badge>
          )}
        </div>
        
        {(task.progress !== undefined || isUpdatingProgress) && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            
            {isUpdatingProgress ? (
              <div className="space-y-2">
                <input type="range" min="0" max="100" value={progress} onChange={handleProgressChange} className="w-full cursor-pointer" />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsUpdatingProgress(false)}>Cancel</Button>
                  <Button size="sm" onClick={saveProgress} className="bg-gradient-to-r from-brand-indigo to-brand-purple">Save</Button>
                </div>
              </div>
            ) : (
              <div
                className="relative h-2 rounded-full bg-secondary cursor-pointer"
                onClick={() => setIsUpdatingProgress(true)}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-indigo to-brand-purple rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            
            {task.completed && (
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                <span>Complete</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
