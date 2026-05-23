
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, ListTodo, Calendar, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-background/95 dark:from-background dark:to-background/95">
        <div className="app-page">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-5xl font-bold tracking-tight">
                Organize today,
                <span className="bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent">
                  {" achieve tomorrow"}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Plan It, Do It helps you organize your day efficiently and accomplish your tasks.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                {isAuthenticated ? (
                  <Button asChild size="lg" className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 transition-opacity">
                    <Link to="/dashboard">My Tasks</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg" className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 transition-opacity">
                      <Link to="/signup">Get Started</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-foreground/20 dark:border-foreground/30">
                      <Link to="/login">Login</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-indigo to-brand-purple rounded-lg blur-md opacity-30"></div>
                <div className="relative bg-card dark:bg-card/80 rounded-lg shadow-xl p-6 border dark:border-white/10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/30 dark:bg-muted/20">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Complete project presentation</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/30 dark:bg-muted/20">
                      <CheckCircle className="h-5 w-5 text-brand-purple" />
                      <span>Schedule team meeting</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/30 dark:bg-muted/20">
                      <CheckCircle className="h-5 w-5 text-brand-purple" />
                      <span>Review monthly goals</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="app-page">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Features That Help You Stay Productive</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple yet powerful tools to organize your tasks and boost productivity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card dark:bg-card/70">
              <div className="h-12 w-12 rounded-full bg-brand-indigo/10 flex items-center justify-center mb-4 dark:bg-brand-indigo/20">
                <ListTodo className="h-6 w-6 text-brand-indigo" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Task Management</h3>
              <p className="text-muted-foreground">
                Create, edit, and organize your tasks with ease. Mark tasks as complete when you're done.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card dark:bg-card/70">
              <div className="h-12 w-12 rounded-full bg-brand-purple/10 flex items-center justify-center mb-4 dark:bg-brand-purple/20">
                <Calendar className="h-6 w-6 text-brand-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Due Dates</h3>
              <p className="text-muted-foreground">
                Set due dates for your tasks so you know what needs to get done and when.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card dark:bg-card/70">
              <div className="h-12 w-12 rounded-full bg-brand-blue/10 flex items-center justify-center mb-4 dark:bg-brand-blue/20">
                <User className="h-6 w-6 text-brand-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personal Account</h3>
              <p className="text-muted-foreground">
                Your tasks are saved to your personal account, accessible from anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-brand-indigo/10 to-brand-purple/10 dark:from-brand-indigo/5 dark:to-brand-purple/5">
        <div className="app-page text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Things Done?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Plan it, track it, complete it! Task by task, day by day, achieve your goals the organized way.
          </p>
          {isAuthenticated ? (
            <Button asChild size="lg" className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 transition-opacity">
              <Link to="/dashboard">My Tasks</Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 transition-opacity">
              <Link to="/signup">Get Started Now</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
