import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, FolderOpen } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import ProjectForm from '@/components/ProjectForm';
import SearchBar from '@/components/SearchBar';

const Projects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch real data from MongoDB niu
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(data);
      }
    } catch (err) {
      console.error("Fetch projects failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 2. Add Project to MongoDB
  const handleAddProject = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Project saved to DB' });
        fetchProjects(); // Refresh the list
        setIsDialogOpen(false);
      }
    } catch (err) {
      toast({ variant: "destructive", title: 'Error saving project' });
    }
  };

  // 3. Delete from MongoDB
  const handleDeleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setProjects(projects.filter(p => p._id !== id));
        toast({ title: 'Gone!', description: 'Project deleted from Mongo' });
      }
    } catch (err) {
      console.log("Delete error");
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleProjectClick = (project) => {
    navigate(`/projects/${project._id}`); // Mongo uses _id  
  };

  // Search filter
  const filteredProjects = projects.filter(p => {
    const matchesTab = activeTab === 'all' || p.status?.toLowerCase() === activeTab;
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) return <div className="p-10 text-center">Loading Projects...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Project List</h1>
        <Button onClick={() => { setEditingProject(null); setIsDialogOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Find project..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center col-span-full py-10">
             <FolderOpen className="h-10 w-10 mx-auto opacity-20" />
             <p>No projects found niu.</p>
          </div>
        ) : (
          filteredProjects.map(p => (
            <ProjectCard
              key={p._id}
              project={p}
              onEdit={() => handleEditProject(p)}
              onDelete={() => handleDeleteProject(p._id)}
              onClick={() => handleProjectClick(p)}
            />
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle>{editingProject ? 'Update' : 'New Project'}</DialogTitle>
          <ProjectForm
            onSubmit={handleAddProject}
            initialData={editingProject}
            closeDialog={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
