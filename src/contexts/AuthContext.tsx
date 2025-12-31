import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, User> = {
  'admin@minhaaj.ac.ke': {
    id: '1',
    email: 'admin@minhaaj.ac.ke',
    name: 'Admin User',
    role: 'admin',
    phone: '+254 793 746 424',
  },
  'teacher@minhaaj.ac.ke': {
    id: '2',
    email: 'teacher@minhaaj.ac.ke',
    name: 'Ahmed Hassan',
    role: 'staff',
    phone: '+254 700 247 273',
  },
  'parent@minhaaj.ac.ke': {
    id: '3',
    email: 'parent@minhaaj.ac.ke',
    name: 'Fatima Ali',
    role: 'parent',
    phone: '+254 723 786 060',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('minhaaj_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const mockUser = mockUsers[email];
    if (mockUser && password === 'demo123') {
      const userWithRole = { ...mockUser, role };
      setUser(userWithRole);
      localStorage.setItem('minhaaj_user', JSON.stringify(userWithRole));
    } else {
      throw new Error('Invalid credentials');
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('minhaaj_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
