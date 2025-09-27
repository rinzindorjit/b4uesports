import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SimpleAuthContextType {
  isAuthenticated: boolean;
  user: { username: string; email: string } | null;
  isLoading: boolean;
  authenticate: () => void;
  logout: () => void;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

interface SimpleAuthProviderProps {
  children: ReactNode;
}

export function SimpleAuthProvider({ children }: SimpleAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('simple_user');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('Restored session from localStorage');
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        // Clear invalid data
        localStorage.removeItem('simple_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const authenticate = () => {
    setIsLoading(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      const mockUser = {
        username: 'test_user',
        email: 'test@example.com'
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      // Save to localStorage
      localStorage.setItem('simple_user', JSON.stringify(mockUser));
      
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('simple_user');
  };

  return (
    <SimpleAuthContext.Provider value={{
      isAuthenticated,
      user,
      isLoading,
      authenticate,
      logout,
    }}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}