import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  fullname?: {
    firstname: string;
    lastname?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isDriver: boolean;
  login: (email: string, password: string, isDriver?: boolean) => Promise<void>;
  register: (data: any, isDriver?: boolean) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isDriver, setIsDriver] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedIsDriver = localStorage.getItem('isDriver') === 'true';
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsDriver(storedIsDriver);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, isDriverMode = false) => {
    try {
      const response = isDriverMode
        ? await authAPI.loginCaptain({ email, password })
        : await authAPI.loginUser({ email, password });
      
      // Handle both 'user' and 'captain' response keys
      const { token: newToken, user: userData, captain: captainData } = response.data;
      const finalUserData = userData || captainData;
      
      if (!newToken || !finalUserData) {
        throw new Error('Invalid response from server');
      }
      
      setToken(newToken);
      setUser(finalUserData);
      setIsDriver(isDriverMode);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(finalUserData));
      localStorage.setItem('isDriver', String(isDriverMode));
    } catch (error: any) {
      // Better error message extraction
      let errorMessage = 'Login failed';
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.map((e: any) => e.msg || e.message).join(', ');
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  };

  const register = async (data: any, isDriverMode = false) => {
    try {
      const response = isDriverMode
        ? await authAPI.registerCaptain(data)
        : await authAPI.registerUser(data);
      
      // Handle both 'user' and 'captain' response keys
      const { token: newToken, user: userData, captain: captainData } = response.data;
      const finalUserData = userData || captainData;
      
      if (!newToken || !finalUserData) {
        throw new Error('Invalid response from server');
      }
      
      setToken(newToken);
      setUser(finalUserData);
      setIsDriver(isDriverMode);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(finalUserData));
      localStorage.setItem('isDriver', String(isDriverMode));
    } catch (error: any) {
      // Better error message extraction
      let errorMessage = 'Registration failed';
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.map((e: any) => e.msg || e.message).join(', ');
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsDriver(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isDriver');
    
    // Call logout API
    if (isDriver) {
      authAPI.logoutCaptain().catch(console.error);
    } else {
      authAPI.logoutUser().catch(console.error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isDriver, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

