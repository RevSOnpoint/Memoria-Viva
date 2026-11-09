import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, setActiveUserEmail } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  demoUsers: User[];
  isLoading: boolean;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<User>;
  loginAs: (user: User) => void;
  logout: () => void;
  // Accesibilidad para adultos mayores
  fontSizeScale: number; // 1.0 (18px) hasta 2.0 (36px)
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  // Contexto de memoria activa
  activeMemoriaId: number | null;
  setActiveMemoriaId: (id: number | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'memoria-viva.session.user';

const readStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.email !== 'string' ||
      typeof parsed.full_name !== 'string' ||
      typeof parsed.role !== 'string'
    ) {
      return null;
    }

    return parsed as User;
  } catch {
    return null;
  }
};

const persistUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    return;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => readStoredUser());
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fontSizeScale, setFontSizeScale] = useState<number>(1.0);
  const [activeMemoriaId, setActiveMemoriaId] = useState<number | null>(null);

  useEffect(() => {
    api.getDemoUsers()
      .then(users => {
        setDemoUsers(users);
        setCurrentUser(previousUser => {
          if (!previousUser) return null;
          return users.find(user => user.email === previousUser.email) || previousUser;
        });
      })
      .catch(err => {
        console.error('Error cargando usuarios demo:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (currentUser) {
      setActiveUserEmail(currentUser.email);
      persistUser(currentUser);
    }
  }, [currentUser]);

  const loginAs = (user: User) => {
    setCurrentUser(user);
    setActiveUserEmail(user.email);
    persistUser(user);
  };

  const login = async (email: string, password: string): Promise<User> => {
    const user = await api.login(email.trim().toLowerCase(), password);
    loginAs(user);
    return user;
  };

  const switchRole = (role: UserRole) => {
    const target = demoUsers.find(u => u.role === role);
    if (target) {
      loginAs(target);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveUserEmail('');
    persistUser(null);
  };

  // Control de tamaño de fuente
  const increaseFontSize = () => {
    setFontSizeScale(prev => {
      const next = Math.min(2.0, Number((prev + 0.15).toFixed(2)));
      document.documentElement.style.setProperty('--base-font-size', `${Math.round(18 * next)}px`);
      return next;
    });
  };

  const decreaseFontSize = () => {
    setFontSizeScale(prev => {
      const next = Math.max(0.9, Number((prev - 0.15).toFixed(2)));
      document.documentElement.style.setProperty('--base-font-size', `${Math.round(18 * next)}px`);
      return next;
    });
  };

  const resetFontSize = () => {
    setFontSizeScale(1.0);
    document.documentElement.style.setProperty('--base-font-size', '18px');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        demoUsers,
        isLoading,
        activeRole: currentUser?.role || 'Usuario',
        switchRole,
        login,
        loginAs,
        logout,
        fontSizeScale,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        activeMemoriaId,
        setActiveMemoriaId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

