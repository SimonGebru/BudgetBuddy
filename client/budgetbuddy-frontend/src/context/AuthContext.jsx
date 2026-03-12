import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, isAuthenticated, logout } from "@/services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        if (!isAuthenticated()) {
          setUser(null);
          return;
        }

        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        await logout();
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated: !!user,
      isAuthLoading,
      clearAuth: async () => {
        await logout();
        setUser(null);
      },
    }),
    [user, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}