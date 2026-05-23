import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, FolderOpen, Clock } from 'lucide-react';
import { format, isBefore } from 'date-fns';

const ProjectCard = ({ project, tasks, onEdit, onDelete, onClick }) => {
  const projectTasks = (tasks || []).filter(t => t.projectId === project.id);
  const completedCount = projectTasks.filter(t => t.status === 'completed').length;
  const totalCount = projectTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const isOverdue = project.deadline && isBefore(new Date(project.deadline), new Date()) && project.status !== 'completed';

  const statusColor = {
    active: 'bg-green-500/10 text-green-600 border-green-200',
    completed: 'bg-blue-500/10 text-blue-600 border-blue-200',
    on_hold: 'bg-amber-500/10 text-amber-600 border-amber-200',
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
      onClick={() => onClick(project)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <FolderOpen className="h-5 w-5 mt-0.5 text-brand-purple" />
            <div>
              <h3 className="font-medium">{project.title}</h3>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(project)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(project.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant="outline" className={`text-xs rounded-md ${statusColor[project.status]}`}>
            {project.status.replace('_', ' ')}
          </Badge>
          {project.deadline && (
            <Badge
              variant="outline"
              className={`flex items-center gap-1 text-xs rounded-md ${
                isOverdue ? 'bg-red-500/10 text-red-500 border-red-200' : 'bg-blue-500/10 text-blue-500 border-blue-200'
              }`}
            >
              <Clock className="h-3 w-3" />
              {format(new Date(project.deadline), 'MMM d')}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {completedCount}/{totalCount} tasks
          </span>
        </div>
        {totalCount > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <div className="relative h-2 rounded-full bg-secondary">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-indigo to-brand-purple rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
