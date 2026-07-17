import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'HR Manager' | 'Employee';
  profileImage: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identity: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session on startup
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          
          // Verify token validity by requesting profile details
          const res = await api.get(`/employees/${parsedUser.id}`);
          if (res.data.success) {
            const emp = res.data.employee;
            setUser({
              id: emp._id,
              employeeId: emp.employeeId,
              name: emp.name,
              email: emp.email,
              role: emp.role,
              profileImage: emp.profileImage || '',
            });
          } else {
            // Force logout if invalid
            handleLogout();
          }
        } catch (error) {
          console.error('Session restoration failed:', error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const handleLogin = async (identity: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { identity, password });
      if (res.data.success) {
        const { token: userToken, user: loggedUser } = res.data;
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setToken(userToken);
        setUser(loggedUser);
      }
    } catch (error: any) {
      handleLogout();
      throw error.response?.data?.message || 'Login failed. Please verify credentials.';
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setLoading(false);
    // Ping API logout (non-blocking)
    api.post('/auth/logout').catch(() => {});
  };

  const updateUser = (updatedUser: Partial<User>): void => {
    if (user) {
      const newUserData = { ...user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        logout: handleLogout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
