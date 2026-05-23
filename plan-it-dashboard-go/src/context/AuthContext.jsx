import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null); 

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check login status on refresh niu
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error("Local storage parse error");
      }
    }
    setIsLoading(false);
  }, []);

  const signup = async (name, email, password) => {
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Signup failed');

      toast({
        title: "Account Created!",
        description: "Your info is now in MongoDB. Try logging in now.",
      });
      
      navigate('/login');
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: err.message,
      });
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Check your credentials');

      // Save user and token from backend
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token); 
      
      toast({
        title: "Success!",
        description: `Welcome back ${data.user.name}`,
      });
      
      navigate('/dashboard');
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.message,
      });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.clear(); 
    toast({ title: "Logged out" });
    navigate('/');
  };


  const updateProfile = (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
    console.log("Profile updated locally niu");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
