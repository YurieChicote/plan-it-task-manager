import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import SearchBar from '@/components/SearchBar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Filter, AlignRight, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from "@/components/ui/checkbox";
import { format, isToday, isSameDay } from 'date-fns';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (user) {
      const storedTasks = localStorage.getItem(`tasks-${user.id}`);
      if (storedTasks) {
        try {
          const parsedTasks = JSON.parse(storedTasks).map((task) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            status: task.status || (task.completed ? 'completed' : 'todo'),
          }));
          setTasks(parsedTasks);
        } catch (e) {
          console.error('Error parsing stored tasks:', e);
        }
      }

      const storedProjects = localStorage.getItem(`projects-${user.id}`);
      if (storedProjects) {
        try {
          setProjects(JSON.parse(storedProjects).map((p) => ({
            ...p,
            deadline: p.deadline ? new Date(p.deadline) : undefined,
          })));
        } catch (e) {
          console.error('Error parsing projects:', e);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.filterBy) {
      setFilterBy(location.state.filterBy);
    }
  }, [location.state]);
  
  useEffect(() => {
    if (user) {
      localStorage.setItem(`tasks-${user.id}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  const handleAddTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      completed: taskData.status === 'completed',
      status: taskData.status || 'todo',
    };
    setTasks([...tasks, newTask]);
    toast({ title: "Task added", description: "Your task has been added successfully." });
  };
  
  const handleUpdateTask = (taskData) => {
    if (!editingTask) return;
    const updatedTasks = tasks.map(task => 
      task.id === editingTask.id 
        ? { ...task, ...taskData, completed: taskData.status === 'completed' } 
        : task
    );
    setTasks(updatedTasks);
    setEditingTask(null);
    toast({ title: "Task updated", description: "Your task has been updated successfully." });
  };
  
  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({ title: "Task deleted", description: "Your task has been deleted." });
  };
  
  const handleTaskStatusChange = (id, completed) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed, status: completed ? 'completed' : 'todo' } : task
    ));
    toast({
      title: completed ? "Task completed" : "Task reopened",
      description: completed ? "Great job on completing your task!" : "Your task has been reopened.",
    });
  };
  
  const handleProgressUpdate = (id, progress) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, progress, completed: progress === 100 ? true : task.completed, status: progress === 100 ? 'completed' : task.status } 
        : task
    ));
    if (progress === 100) {
      toast({ title: "Task progress complete!", description: "You've reached 100% progress on this task." });
    }
  };
  
  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };
  
  const getNotifications = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return {
      overdue: tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < today),
      today: tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).toDateString() === today.toDateString()),
      tomorrow: tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).toDateString() === tomorrow.toDateString()),
      upcoming: tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) > tomorrow && new Date(t.dueDate) <= nextWeek),
    };
  };
  
  const notifications = getNotifications();
  
  const getFilteredAndSortedTasks = () => {
    let filtered = tasks;

    // Tab filter (status-based)
    if (activeTab === "todo") filtered = filtered.filter(t => (t.status || 'todo') === 'todo');
    else if (activeTab === "in_progress") filtered = filtered.filter(t => t.status === 'in_progress');
    else if (activeTab === "completed") filtered = filtered.filter(t => t.status === 'completed' || t.completed);

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      );
    }

    // Dropdown filter
    if (filterBy === "today") {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === today.toDateString());
    } else if (filterBy === "thisWeek") {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(today); endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
      filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) <= endOfWeek);
    } else if (filterBy === "overdue") {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < today);
    } else if (filterBy.startsWith("priority:")) {
      filtered = filtered.filter(t => t.priority === filterBy.split(":")[1]);
    } else if (filterBy.startsWith("category:")) {
      filtered = filtered.filter(t => t.category === filterBy.split(":")[1]);
    } else if (filterBy.startsWith("project:")) {
      filtered = filtered.filter(t => t.projectId === filterBy.split(":")[1]);
    } else if (filterBy === "selectedDate" && selectedDate) {
      filtered = filtered.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), selectedDate));
    }
    
    return [...filtered].sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === "priority") {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      } else if (sortBy === "progress") {
        return (b.progress || 0) - (a.progress || 0);
      }
      return parseInt(b.id) - parseInt(a.id);
    });
  };
  
  const filteredAndSortedTasks = getFilteredAndSortedTasks();
  const availableCategories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
  
  const calculateStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalProgress = tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
    const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0;
    return { total, completed, completionRate, averageProgress };
  };
  
  const stats = calculateStats();
  
  const getTasksForDate = (date) => tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), date));
  
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (date) setFilterBy('selectedDate');
  };
  
  const hasTasksOnDate = (date) => tasks.some(t => t.dueDate && isSameDay(new Date(t.dueDate), date));
  
  return (
    <div className="app-page">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <Button 
          onClick={() => { setEditingTask(null); setIsDialogOpen(true); }}
          className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
              Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-muted-foreground text-sm">{stats.completed} of {stats.total} tasks complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
              Due Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.today.length}</div>
            <p className="text-muted-foreground text-sm">{notifications.overdue.length} overdue tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-purple-600" />
              Average Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-muted-foreground text-sm">Across all tasks</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Calendar sidebar */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="w-full rounded-md border pointer-events-auto"
                  modifiers={{
                    today: (date) => isToday(date),
                    hasTasks: (date) => hasTasksOnDate(date),
                  }}
                  modifiersClassNames={{
                    today: "bg-accent text-accent-foreground font-bold",
                    hasTasks: "border-brand-purple border-2",
                  }}
                  styles={{
                    caption: { textAlign: 'center' },
                  }}
                />
              </div>
              {selectedDate && (
                <div className="p-3 border-t mt-2">
                  <h3 className="font-medium text-sm mb-2">
                    {isToday(selectedDate) ? "Today" : format(selectedDate, "MMM dd, yyyy")}
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-auto pr-1">
                    {getTasksForDate(selectedDate).length > 0 ? (
                      getTasksForDate(selectedDate).map(task => (
                        <div key={task.id} className={`p-2 text-sm rounded-md border ${task.completed ? 'bg-muted/50 text-muted-foreground/80 border-muted/80' : 'bg-card'}`}>
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={(checked) => handleTaskStatusChange(task.id, Boolean(checked))}
                              className="mt-0.5 cursor-pointer"
                            />
                            <div>
                              <p className={task.completed ? 'line-through' : ''}>{task.title}</p>
                              {task.dueTime && <p className="text-xs text-muted-foreground">{task.dueTime}</p>}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No tasks for this date</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Tasks list */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="todo">To Do</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col md:flex-row gap-2 w-full">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search tasks..." />
          </div>
          
          <div className="space-y-4">
            {filteredAndSortedTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? "No tasks match your search." :
                    filterBy === "overdue" ? "Great job! You don't have any overdue tasks." :
                    activeTab === "all" ? "You don't have any tasks yet. Add your first task to get started!" :
                    activeTab === "todo" ? "No tasks in To Do." :
                    activeTab === "in_progress" ? "No tasks in progress." :
                    "No completed tasks yet."}
                </p>
              </div>
            ) : (
              filteredAndSortedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleTaskStatusChange}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onProgressUpdate={handleProgressUpdate}
                />
              ))
            )}
          </div>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          <TaskForm 
            onSubmit={editingTask ? handleUpdateTask : handleAddTask}
            initialData={editingTask || undefined}
            projects={projects}
            closeDialog={() => { setIsDialogOpen(false); setEditingTask(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
