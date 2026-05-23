
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { MoonIcon, SunIcon, LogOut, UserPlus } from 'lucide-react';

const Settings = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Check the current theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(currentTheme === 'dark');
  }, []);

  const handleDarkModeToggle = (checked) => {
    if (checked) {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    }
    setIsDarkMode(checked);
    
    toast({
      title: `${checked ? 'Dark' : 'Light'} mode activated`,
      description: `The application is now in ${checked ? 'dark' : 'light'} mode.`,
    });
  };
  
  const handleSignOutAll = () => {
    logout();
    toast({
      title: "Signed out",
      description: "You have been signed out of all accounts.",
    });
    navigate('/login');
  };
  
  const handleAddAccount = () => {
    // Store current auth state temporarily
    localStorage.setItem('returnToAccount', 'true');
    logout();
    navigate('/login');
    toast({
      title: "Add Account",
      description: "Please sign in with the new account you wish to add.",
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="app-page">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>Customize how the application looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-secondary/50">
                  {isDarkMode ? (
                    <MoonIcon className="h-5 w-5 text-indigo-400" />
                  ) : (
                    <SunIcon className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <Label htmlFor="dark-mode" className="font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark mode
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-secondary/50">
                  <UserPlus className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Add Another Account</p>
                  <p className="text-sm text-muted-foreground">
                    Add and switch between multiple accounts
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleAddAccount}>
                Add Account
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-secondary/50">
                  <LogOut className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">Sign Out of All Accounts</p>
                  <p className="text-sm text-muted-foreground">
                    Log out from all your accounts and sessions
                  </p>
                </div>
              </div>
              <Button variant="destructive" onClick={handleSignOutAll}>
                Sign Out All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
