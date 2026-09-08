import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../../domain/Account';
import { ApiClient } from '../api/apiClient';

export interface AuthUser {
  accountId: number;
  userId: number;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  memberId?: number;
  librarianId?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  role: UserRole | 'GUEST';
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setGuestRole: (role: UserRole | 'GUEST') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('lib_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [guestRole, setGuestRole] = useState<UserRole | 'GUEST'>('GUEST');

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('lib_auth_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      // Validate token with backend /api/auth/me
      const res = await ApiClient.get('/auth/me');
      if (res.success && res.user) {
        setToken(storedToken);
        const storedUser = localStorage.getItem('lib_auth_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser({
              accountId: res.user.accountId,
              userId: res.user.userId,
              username: res.user.username,
              name: res.user.username,
              role: res.user.role,
              memberId: res.user.memberId,
              librarianId: res.user.librarianId,
            });
          }
        }
      } else {
        // Token expired or invalid
        localStorage.removeItem('lib_auth_token');
        localStorage.removeItem('lib_auth_user');
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem('lib_auth_token', newToken);
    localStorage.setItem('lib_auth_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('lib_auth_token');
    localStorage.removeItem('lib_auth_user');
    setToken(null);
    setUser(null);
    setGuestRole('GUEST');
  };

  const activeRole = user ? user.role : guestRole;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        role: activeRole,
        isAuthenticated: !!user,
        login,
        logout,
        setGuestRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
