
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Menu, Bell, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasReadNotifications, setHasReadNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Display nickname if available, otherwise display name
  const displayName = user?.nickname || user?.name;
  
  // Get initials for avatar
  const getInitials = () => {
    if (!displayName) return 'U';
    return displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get notifications
  const getNotifications = () => {
    if (!user) return { overdue: [], today: [], tomorrow: [], upcoming: [], total: 0 };
    
    const storedTasks = localStorage.getItem(`tasks-${user.id}`);
    if (!storedTasks) return { overdue: [], today: [], tomorrow: [], upcoming: [], total: 0 };
    
    const tasks = JSON.parse(storedTasks);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const overdueNotifications = tasks.filter(task => 
      !task.completed && task.dueDate && new Date(task.dueDate) < today
    );
    
    const todayNotifications = tasks.filter(task => 
      !task.completed && task.dueDate && 
      new Date(task.dueDate).toDateString() === today.toDateString()
    );
    
    const tomorrowNotifications = tasks.filter(task => 
      !task.completed && task.dueDate && 
      new Date(task.dueDate).toDateString() === tomorrow.toDateString()
    );
    
    const upcomingNotifications = tasks.filter(task => 
      !task.completed && task.dueDate && 
      new Date(task.dueDate) > tomorrow && 
      new Date(task.dueDate) <= nextWeek
    );
    
    return {
      overdue: overdueNotifications,
      today: todayNotifications,
      tomorrow: tomorrowNotifications,
      upcoming: upcomingNotifications,
      total: overdueNotifications.length + todayNotifications.length + tomorrowNotifications.length
    };
  };
  
  const notifications = getNotifications();
  const hasUnreadNotifications = !hasReadNotifications && notifications.total > 0;

  // Mark notifications as read
  const markNotificationsAsRead = () => {
    setHasReadNotifications(true);
  };

  // Handle navigation to task and mark notification as read
  const handleNotificationClick = (taskType, taskId = null) => {
    // Close the notification popover
    setShowNotifications(false);
    
    // Mark notifications as read
    markNotificationsAsRead();
    
    // Navigate to dashboard with specific filter
    if (taskType === 'overdue') {
      navigate('/dashboard', { state: { filterBy: 'overdue' }});
      toast({
        title: "Navigating to overdue tasks",
        description: "Showing all overdue tasks that need your attention."
      });
    } else if (taskType === 'today') {
      navigate('/dashboard', { state: { filterBy: 'today' }});
      toast({
        title: "Navigating to today's tasks",
        description: "Showing all tasks due today."
      });
    } else if (taskType === 'tomorrow') {
      navigate('/dashboard', { state: { filterBy: 'tomorrow' }});
      toast({
        title: "Navigating to tomorrow's tasks",
        description: "Showing all tasks due tomorrow."
      });
    } else if (taskId) {
      // If we had individual task pages, we could navigate to them here
      navigate('/dashboard');
    }
  };
  
  const authenticatedLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Projects', to: '/projects' },
    { label: 'Account', to: '/account' },
    { label: 'Settings', to: '/settings' },
  ];

  const guestLinks = [
    { label: 'Home', to: '/' },
    { label: 'Login', to: '/login' },
    { label: 'Sign Up', to: '/signup' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-brand-purple" />
          <span className="text-2xl font-bold bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent">
            Plan It, Do It
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex">
                <span className="text-sm text-muted-foreground mr-2">
                  Hello, {displayName}
                </span>
              </div>
              
              <Link to="/account" className="cursor-pointer" aria-label="Go to account settings">
                <Avatar className="h-8 w-8 bg-brand-purple text-white">
                  {user?.profileImage ? (
                    <AvatarImage src={user.profileImage} alt={displayName} />
                  ) : (
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  )}
                </Avatar>
              </Link>
              
              <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative cursor-pointer" 
                    aria-label="View notifications"
                    title="Notifications: View upcoming and overdue tasks"
                  >
                    <Bell className="h-5 w-5" />
                    {hasUnreadNotifications && (
                      <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 cursor-pointer"
                      onClick={markNotificationsAsRead}
                      aria-label="Mark all as read"
                      title="Mark all notifications as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Due</TableHead>
                          <TableHead>Priority</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notifications.overdue.length > 0 ? (
                          notifications.overdue.map(task => (
                            <TableRow 
                              key={task.id} 
                              className="bg-red-50 dark:bg-red-900/10 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20"
                              onClick={() => handleNotificationClick('overdue', task.id)}
                            >
                              <TableCell className="font-medium">{task.title}</TableCell>
                              <TableCell className="text-destructive">Overdue</TableCell>
                              <TableCell>{task.priority}</TableCell>
                            </TableRow>
                          ))
                        ) : null}
                        
                        {notifications.today.length > 0 ? (
                          notifications.today.map(task => (
                            <TableRow 
                              key={task.id} 
                              className="cursor-pointer hover:bg-accent/50"
                              onClick={() => handleNotificationClick('today', task.id)}
                            >
                              <TableCell className="font-medium">{task.title}</TableCell>
                              <TableCell>Today</TableCell>
                              <TableCell>{task.priority}</TableCell>
                            </TableRow>
                          ))
                        ) : null}
                        
                        {notifications.tomorrow.length > 0 ? (
                          notifications.tomorrow.map(task => (
                            <TableRow 
                              key={task.id} 
                              className="cursor-pointer hover:bg-accent/50"
                              onClick={() => handleNotificationClick('tomorrow', task.id)}
                            >
                              <TableCell className="font-medium">{task.title}</TableCell>
                              <TableCell>Tomorrow</TableCell>
                              <TableCell>{task.priority}</TableCell>
                            </TableRow>
                          ))
                        ) : null}
                        
                        {notifications.overdue.length === 0 && 
                          notifications.today.length === 0 && 
                          notifications.tomorrow.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              No upcoming tasks or reminders
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login" className="cursor-pointer">Login</Link>
              </Button>
              <Button 
                asChild
                className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="cursor-pointer"
                title="Open navigation menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] pr-0">
              <div className="flex h-full flex-col gap-3 py-4">
                {isAuthenticated && (
                  <SheetClose asChild>
                    <Link
                      to="/account"
                      className="mb-2 flex items-center gap-3 rounded-md px-4 py-3 hover:bg-muted"
                    >
                      <Avatar className="h-10 w-10 bg-brand-purple text-white">
                        {user?.profileImage ? (
                          <AvatarImage src={user.profileImage} alt={displayName} />
                        ) : (
                          <AvatarFallback>{getInitials()}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{displayName}</span>
                        <span className="text-sm text-muted-foreground">{user?.email}</span>
                      </div>
                    </Link>
                  </SheetClose>
                )}

                {(isAuthenticated ? authenticatedLinks : guestLinks).map((item) => (
                  <SheetClose asChild key={item.to}>
                    <Link
                      to={item.to}
                      className={`rounded-md px-4 py-2.5 font-medium transition-colors hover:bg-muted ${
                        location.pathname === item.to ? 'bg-muted text-brand-purple' : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}

                {isAuthenticated && (
                  <div className="mt-auto border-t pt-4">
                    <Button
                      variant="ghost"
                      onClick={logout}
                      className="w-full justify-start px-4 cursor-pointer"
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
