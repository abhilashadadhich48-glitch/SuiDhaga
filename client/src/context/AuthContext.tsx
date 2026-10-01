import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

interface UserMeasurements {
  upperBody?: {
    chest: number;
    shoulder: number;
    waist: number;
    sleeveLength: number;
  };
  lowerBody?: {
    hip: number;
    inseam: number;
    outseam: number;
    waist: number;
  };
  accents?: {
    neck: number;
    wrist: number;
    ankle: number;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'tailor' | 'admin';
  profilePicture?: string;
  city?: string;
  bio?: string;
  isVerified?: boolean;
  measurements?: UserMeasurements;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (credentials: any) => Promise<void>;
  register: (credentials: any) => Promise<void>;
  logout: () => void;
  updateUserProfile: (formData: FormData) => Promise<void>;
  updateUserMeasurements: (measurements: UserMeasurements) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user session', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (credentials: any) => {
    const res = await authAPI.login(credentials);
    const { token: receivedToken, ...userData } = res.data;
    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    setUser(userData);
  };

  const register = async (credentials: any) => {
    const res = await authAPI.register(credentials);
    const { token: receivedToken, ...userData } = res.data;
    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (formData: FormData) => {
    const res = await authAPI.updateProfile(formData);
    setUser(res.data);
  };

  const updateUserMeasurements = async (measurements: UserMeasurements) => {
    const res = await authAPI.updateMeasurements(measurements);
    if (user) {
      setUser({ ...user, measurements: res.data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        login,
        register,
        logout,
        updateUserProfile,
        updateUserMeasurements,
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
