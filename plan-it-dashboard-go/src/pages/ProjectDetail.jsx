import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, ArrowLeft, FolderOpen, Clock } from 'lucide-react';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';

const ProjectDetail = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // 1. Fetch Project + Tasks from Backend niu
  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch project details
      const pRes = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const pData = await pRes.json();
      
      // Fetch tasks for this project
      const tRes = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks?project=${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tData = await tRes.json();

      if (pRes.ok) setProject(pData);
      if (tRes.ok) setTasks(tData);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  // 2. Add Task to MongoDB
  const handleAddTask = async (taskData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...taskData, project: projectId }),
      });

      if (res.ok) {
        toast({ title: 'Task Added' });
        loadData(); // Refresh list
        setIsTaskDialogOpen(false);
      }
    } catch (err) {
      toast({ title: 'Error adding task', variant: 'destructive' });
    }
  };

  if (loading) return <div className="p-10 text-center">Loading project...</div>;
  if (!project) return <div className="p-10 text-center">Project not found.</div>;

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => navigate('/projects')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
             <FolderOpen className="text-purple-500" />
             <h1 className="text-2xl font-bold">{project.name}</h1>
             <Badge>{project.status}</Badge>
          </div>
          <p className="text-muted-foreground ml-8">{project.description}</p>
        </div>
        <Button onClick={() => { setEditingTask(null); setIsTaskDialogOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <h2 className="text-xl font-semibold mb-2">Project Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-muted-foreground italic">No tasks created yet.</p>
        ) : (
          tasks.map(t => (
            <TaskCard key={t._id} task={t} />
          ))
        )}
      </div>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogTitle>New Project Task</DialogTitle>
          <TaskForm 
            onSubmit={handleAddTask} 
            closeDialog={() => setIsTaskDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetail;
